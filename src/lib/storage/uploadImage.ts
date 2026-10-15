export interface ImageStorage {
  upload(file: File): Promise<string>;
}
