// back-end/scripts/updateMessagePolicy.js — one-off, run once then delete
import prisma from '../prisma.js';

async function run() {
  const result = await prisma.user.updateMany({
    where: { messagePolicy: 'CONNECTIONS_ONLY' },
    data: { messagePolicy: 'ANYONE' },
  });
  console.log(`Updated ${result.count} users to ANYONE`);
}

run().then(() => process.exit(0));