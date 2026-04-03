import { GetProductReviewsQuery } from "@/graphql/graphql";
import { Helper } from "@/lib/models/helper";

class ProductReview {
  author: string;
  date: string;
  id: number;
  message: string;
  rating: number;

  constructor({
    author,
    date,
    id,
    message,
    rating,
  }: {
    author: string;
    date: string;
    id: number;
    message: string;
    rating: number;
  }) {
    this.id = id;
    this.author = author;
    this.date = date;
    this.message = message;
    this.rating = rating;
  }
}

export class ProductReviews extends Helper {
  reviews: ProductReview[] = [];
  totalPages: number;

  constructor(data: GetProductReviewsQuery, pageSize: number) {
    super();

    this.totalPages = data.productReviews?.total_count
      ? Math.ceil(data.productReviews.total_count / pageSize) || 1
      : 1;

    this.reviews =
      data.productReviews?.items?.map(
        (review) =>
          new ProductReview({
            author: review?.nickname || "",
            date: review?.created_at || "",
            id: review?.review_id || 0,
            message: review?.detail || "",
            rating: review?.rating || 0,
          })
      ) || [];
  }
}
