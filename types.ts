
export enum Gender {
  FEMALE = 'Nữ',
  MALE = 'Nam'
}

export enum TargetType {
  YOUTH = 'Thanh niên',
  ADULT = 'Người lớn',
  CHILD = 'Trẻ em'
}

export enum ClothingType {
  ORIGINAL = 'Giữ nguyên',
  SHIRT = 'Áo Sơ mi',
  WHITE_SHIRT = 'Áo Sơ mi Trắng',
  POLO = 'Áo Polo',
  STYLISH = 'Áo kiểu',
  PLAIN_TEE = 'Áo phông trơn',
  VEST = 'Áo Vest',
  OFFICE = 'Công sở',
  WOMEN_OFFICE = 'Vest nữ công sở',
  SCHOOL_SCARF = 'Áo trắng & Khăn quàng',
  AO_DAI = 'Áo dài trắng',
  KR_STUDENT_1 = 'Nữ Sinh HQ 1',
  KR_STUDENT_2 = 'Nữ Sinh HQ 2',
  KR_STUDENT_3 = 'Nữ Sinh HQ 3'
}

export enum HairstyleType {
  ORIGINAL = 'Giữ nguyên',
  NEAT = 'Gọn gàng',
  SHORT = 'Tóc ngắn',
  LONG = 'Tóc dài',
  LONG_WAVY = 'Tóc dài bồng bềnh',
  TRENDY = 'Thời trang',
  TIED = 'Tóc buộc gọn',
  TEXTURE_CROP = 'Texture Crop Nam',
  KR_LAYER = 'Layer HQ Nam',
  SHORT_CURLY = 'Xoăn Ngắn Nam',
  TWO_BLOCK = 'Hai Dế Ngắn Nam'
}

export enum BackgroundColor {
  BLUE = 'Xanh',
  WHITE = 'Trắng',
  GREY = 'Xám',
  DARK_BLUE = 'Xanh Đậm'
}

export enum PhotoSize {
  SIZE_3X4 = '3x4',
  SIZE_4X6 = '4x6',
  PASSPORT = 'Hộ chiếu'
}

export enum PaperSize {
  A4 = 'A4 (210x297)',
  A5 = 'A5 (148x210)',
  A6 = 'A6 (105x148)'
}

export interface ProcessingState {
  originalImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  settings: PhotoSettings;
}

export interface PhotoSettings {
  gender: Gender;
  target: TargetType;
  clothing: ClothingType;
  hair: HairstyleType;
  background: BackgroundColor;
  skinBrightening: number;
  beautyLevel: number;
  customDescription: string;
  size: PhotoSize;
  paperSize: PaperSize;
}

export interface BatchItem {
  id: string;
  original: string;
  processed: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
}
