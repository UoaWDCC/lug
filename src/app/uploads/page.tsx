import uploadBlogImage from "@/features/blog/uploadBlogImage";

export default function TestUploadPage() {
  async function handleUpload(formData: FormData) {
    "use server";
    const result = await uploadBlogImage(formData);
    console.log(result);
  }

  return (
    <form action={handleUpload}>
      <input type="file" name="file" accept="image/*" />
      <button type="submit">Upload</button>
    </form>
  );
}
