import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { DocumentPDF } from "@/components/pdf/DocumentPDF";

const resend = new Resend(process.env.RESEND_API_KEY);

// Универсальная отправка документа PDF по email
export async function POST(req: Request) {
  try {
    console.log(`[DOC_SEND] Starting email send process`);
    console.log(`[DOC_SEND] RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);
    console.log(`[DOC_SEND] SMTP_USER: ${process.env.SMTP_USER}`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email: toEmail, documentId } = await req.json();
    if (!toEmail || !documentId) {
      return NextResponse.json(
        { message: "Recipient email and Document ID are required" },
        { status: 400 },
      );
    }

    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId: session.user.id },
      include: { user: { include: { company: true } } },
    });

    if (!doc) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 },
      );
    }

    console.log(`[DOC_SEND] Generating PDF for document ${doc.id} using @react-pdf/renderer`);
    
    const data = (doc.data || {}) as any;

    // Generate PDF with @react-pdf/renderer using DocumentPDF
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
    console.log(`[DOC_SEND] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    await resend.emails.send({
      from: `CV Makers <${process.env.SMTP_USER || "info@cv-makers.co.uk"}>`,
      to: toEmail,
      subject: `${doc.title} from ${doc.user?.company?.name || "CV Makers"}`,
      html: `<p>Please find your document attached.</p>`,
      attachments: [
        {
          filename: `${doc.title || 'Document'}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log(`[DOC_SEND] Email sent successfully to ${toEmail}`);

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error: any) {
    console.error("[DOC_SEND_ERROR]", error);
    console.error("[DOC_SEND_ERROR] Details:", {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
