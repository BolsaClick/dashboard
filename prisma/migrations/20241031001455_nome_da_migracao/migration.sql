-- CreateTable
CREATE TABLE "UserAdmin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStudent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "document" TEXT,
    "birthday" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "address_number" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp_optin" BOOLEAN,
    "high_school_completion_year" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT,
    "courseName" TEXT,

    CONSTRAINT "UserStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "site" TEXT,
    "phone" TEXT,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "partner_id" TEXT,
    "benefits" TEXT,
    "notice" TEXT,
    "about" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "advantages" TEXT,
    "content_html" TEXT,
    "min_price" TEXT,
    "max_discount" TEXT,

    CONSTRAINT "university_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentUniversities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAdmin_email_key" ON "UserAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserStudent_email_key" ON "UserStudent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserStudent_cpf_key" ON "UserStudent"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "university_slug_key" ON "university"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_StudentUniversities_AB_unique" ON "_StudentUniversities"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentUniversities_B_index" ON "_StudentUniversities"("B");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserStudent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentUniversities" ADD CONSTRAINT "_StudentUniversities_A_fkey" FOREIGN KEY ("A") REFERENCES "university"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentUniversities" ADD CONSTRAINT "_StudentUniversities_B_fkey" FOREIGN KEY ("B") REFERENCES "UserStudent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
