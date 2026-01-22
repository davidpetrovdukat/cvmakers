import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { DocumentPDF } from "@/components/pdf/DocumentPDF";

let resendClient: Resend | null | undefined;

function getResendClient(): Resend | null {
  if (resendClient !== undefined) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    resendClient = null;
    return resendClient;
  }
  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { email: toEmail, documentId } = await req.json();
    if (!toEmail || !documentId) return NextResponse.json({ message: "Recipient email and Document ID are required" }, { status: 400 });

    console.log(`[EMAIL_SEND] Sending document ${documentId} to ${toEmail}`);

    const doc = await prisma.document.findFirst({ 
      where: { id: documentId, userId: session.user.id }, 
      include: { user: { include: { company: true } } } 
    });
    
    if (!doc) return NextResponse.json({ message: "Document not found" }, { status: 404 });

    console.log(`[EMAIL_SEND] Generating PDF with @react-pdf/renderer`);

    const data = (doc.data || {}) as any;

    // Generate PDF with @react-pdf/renderer
    const pdfDoc = DocumentPDF({
      title: doc.title,
      documentNo: data.documentNo,
      documentDate: data.documentDate,
      sender: {
        company: doc.user.company?.name || '',
        vat: doc.user.company?.vat || '',
        address: doc.user.company?.address1 || '',
        city: doc.user.company?.city || '',
        country: doc.user.company?.country || '',
        iban: doc.user.company?.iban || '',
        bankName: (doc.user.company as any)?.bankName || undefined,
        bic: doc.user.company?.bic || undefined,
        logoUrl: (doc.user.company as any)?.logoUrl || undefined,
      },
      recipient: {
        company: data.recipient?.company,
        name: data.recipient?.name,
        email: data.recipient?.email,
        address: data.recipient?.address,
        city: data.recipient?.city,
        country: data.recipient?.country,
      },
      content: Array.isArray(data.content) ? data.content : undefined,
      notes: data.notes,
      footerText: data.footerText,
    });

    const pdfBuffer = await renderToBuffer(pdfDoc);
    console.log(`[EMAIL_SEND] PDF generated, size: ${pdfBuffer.length} bytes`);

    const resend = getResendClient();
    if (!resend) {
      console.error('[EMAIL_SEND] Resend API key is missing.');
      return NextResponse.json(
        { message: 'Email service is not configured.' },
        { status: 503 },
      );
    }

    await resend.emails.send({
      from: `CV Makers <${process.env.SMTP_USER || 'info@cv-makers.co.uk'}>`,
      to: toEmail,
      subject: `${doc.title} from ${doc.user?.company?.name || 'CV Makers'}`,
      html: `<p>Please find your document attached.</p>`,
      attachments: [{ filename: `${doc.title || 'Document'}.pdf`, content: pdfBuffer }],
    });

    console.log(`[EMAIL_SEND] Email sent successfully to ${toEmail}`);

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('[EMAIL_SEND_ERROR]', error);
    console.error('[EMAIL_SEND_ERROR] Details:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}





