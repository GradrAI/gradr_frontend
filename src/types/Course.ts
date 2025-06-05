import { Category } from "./Category";
import { MongoDBDefault } from "./MongoDBDefault";

export type Course = MongoDBDefault & {
  id: string;
  name: string;
  lecturerId: string;
  categories: Category[];
};
