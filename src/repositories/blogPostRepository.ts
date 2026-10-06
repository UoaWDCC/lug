import { getPrisma } from "../lib/db/prisma";
import { Prisma, type BlogPost } from "@/generated/prisma/client";
import {
  runRepositoryOperation,
  type RepositoryResult,
} from "@/repositories/repositoryResult";

export type CreateBlogPostResult = RepositoryResult<BlogPost>;

export type UpdateBlogPostResult = RepositoryResult<BlogPost>;

export type DeleteBlogPostResult = RepositoryResult<BlogPost>;

export async function createBlogPost(
  data: Prisma.BlogPostCreateInput,
): Promise<CreateBlogPostResult> {
  return runRepositoryOperation(() =>
    getPrisma().blogPost.create({
      data,
    }),
  );
}

export async function findAllBlogPosts(): Promise<BlogPost[]> {
  return getPrisma().blogPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findPublishedBlogPosts(): Promise<BlogPost[]> {
  return getPrisma().blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function findBlogPostById(id: string): Promise<BlogPost | null> {
  return getPrisma().blogPost.findUnique({
    where: {
      id,
    },
  });
}

export async function updateBlogPost(
  id: string,
  data: Prisma.BlogPostUpdateInput,
): Promise<UpdateBlogPostResult> {
  return runRepositoryOperation(() =>
    getPrisma().blogPost.update({
      where: {
        id,
      },
      data,
    }),
  );
}

export async function deleteBlogPost(
  id: string,
): Promise<DeleteBlogPostResult> {
  return runRepositoryOperation(() =>
    getPrisma().blogPost.delete({
      where: {
        id,
      },
    }),
  );
}
