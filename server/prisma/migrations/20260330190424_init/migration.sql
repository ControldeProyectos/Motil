-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'RESIDENTE', 'SUPERVISOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "EstadoSuministro" AS ENUM ('EN_PROCESO', 'EN_TRANSITO', 'EN_ADUANA', 'ENTREGADO', 'PENDIENTE_OC');

-- CreateEnum
CREATE TYPE "TipoRestriccion" AS ENUM ('CRITICA', 'NO_CRITICA');

-- CreateEnum
CREATE TYPE "EstadoRestriccion" AS ENUM ('ABIERTA', 'EN_PROCESO', 'CERRADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'VIEWER',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "valor_contrato" DECIMAL(14,2) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "semana_actual" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suministros" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "fecha_necesaria" DATE NOT NULL,
    "fecha_llegada" DATE NOT NULL,
    "lead_time_dias" INTEGER,
    "estado" "EstadoSuministro" NOT NULL DEFAULT 'EN_PROCESO',
    "obs" TEXT,
    "creado_por_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suministros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restricciones" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "fecha_atencion" DATE NOT NULL,
    "tipo" "TipoRestriccion" NOT NULL DEFAULT 'CRITICA',
    "estado" "EstadoRestriccion" NOT NULL DEFAULT 'ABIERTA',
    "obs" TEXT,
    "creado_por_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restricciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "frente" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contractual" DECIMAL(6,2) NOT NULL,
    "planificado" DECIMAL(6,2) NOT NULL,
    "real" DECIMAL(6,2) NOT NULL,
    "valor_usd" DECIMAL(14,2) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curva_s" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "semana" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "planificado" DECIMAL(6,3) NOT NULL,
    "real" DECIMAL(6,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curva_s_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "curva_s_proyecto_id_semana_key" ON "curva_s"("proyecto_id", "semana");

-- AddForeignKey
ALTER TABLE "suministros" ADD CONSTRAINT "suministros_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suministros" ADD CONSTRAINT "suministros_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restricciones" ADD CONSTRAINT "restricciones_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restricciones" ADD CONSTRAINT "restricciones_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curva_s" ADD CONSTRAINT "curva_s_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
