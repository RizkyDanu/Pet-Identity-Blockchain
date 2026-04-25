import { Pet } from "../entities/Pet";
import { AppError } from "../utils/errors";

// Peta field input (snake_case) ke kolom model (camelCase).
export const correctionFieldMap = {
  name: "Nama",
  species: "Jenis",
  breed: "Ras",
  birth_date: "Tanggal Lahir",
  color: "Warna",
  physical_mark: "Ciri Fisik",
  age: "Usia",
} as const;

export type CorrectionField = keyof typeof correctionFieldMap;

// Ambil nilai field dari data pet untuk ditampilkan.
export const getPetFieldValue = (pet: Pet, fieldName: CorrectionField) => {
  const prismaField = correctionFieldMap[fieldName];
  const value = (pet as any)[prismaField];
  return value ?? "";
};

// Konversi input string ke tipe data yang tepat.
export const parsePetFieldValue = (
  fieldName: CorrectionField,
  newValue: string
) => {
  const prismaField = correctionFieldMap[fieldName];
  if (prismaField === "Usia") {
    const parsed = Number(newValue);
    if (Number.isNaN(parsed)) {
      throw new AppError("Usia harus angka", 400);
    }
    return parsed;
  }
  if (prismaField === "Tanggal Lahir") {
    const date = new Date(newValue);
    if (Number.isNaN(date.getTime())) {
      throw new AppError("Tanggal lahir tidak valid", 400);
    }
    return date;
  }
  return newValue;
};
