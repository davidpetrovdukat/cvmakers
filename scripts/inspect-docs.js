const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log("LAST 10 DOCUMENTS:");
  docs.forEach(d => {
    console.log(`ID: ${d.id}, Title: ${d.title}, docType: ${d.docType}, date (property on root?): ${d.date}, data keys: ${d.data ? Object.keys(d.data) : 'null'}`);
    if (d.docType === 'invoice') {
      console.log("Invoice JSON Data:", JSON.stringify(d.data, null, 2));
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
