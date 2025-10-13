// // VERSION 4 - unit test setup: mock prisma and ioredis for fast unit tests
// jest.mock('../../src/libs/prisma', () => {
//   return { prisma: { user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), upsert: jest.fn() }, $disconnect: jest.fn() } };
// });

// jest.mock('ioredis', () => jest.fn().mockImplementation(() => ({ set: jest.fn(), get: jest.fn(), del: jest.fn() })));
