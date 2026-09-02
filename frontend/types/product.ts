export type Category = {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
  };
  
  export type Product = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    stock: number;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    categoryId: number;
    category?: Category;
  };