-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "expense_tracker_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_tracker_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_tracker_session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "expense_tracker_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_tracker_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_tracker_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_tracker_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "expense_tracker_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_tracker_transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "metodePembayaran" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_tracker_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expense_tracker_user_email_key" ON "expense_tracker_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "expense_tracker_session_token_key" ON "expense_tracker_session"("token");

-- AddForeignKey
ALTER TABLE "expense_tracker_session" ADD CONSTRAINT "expense_tracker_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "expense_tracker_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_tracker_account" ADD CONSTRAINT "expense_tracker_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "expense_tracker_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

