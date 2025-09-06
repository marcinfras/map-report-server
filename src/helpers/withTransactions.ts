import { startSession, type ClientSession } from 'mongoose';

export const withTransactions = async <T>(
  cb: (session: ClientSession) => Promise<T>
) => {
  const session = await startSession();
  try {
    return await session.withTransaction(async (session: ClientSession) => {
      return await cb(session);
    });
  } finally {
    await session.endSession();
  }
};
