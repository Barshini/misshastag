import { supabase } from "./supabase";
import productPeplum from "@/assets/product-peplum.png";
import productCoord from "@/assets/product-coord.png";
import productDress from "@/assets/product-dress.png";

export async function seedDatabaseIfNeeded() {
  try {
    // 1. Seed Reviews
    const { data: existingReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id");

    if (reviewsError) {
      console.error("Error checking reviews for seeding:", reviewsError);
    } else if (!existingReviews || existingReviews.length === 0) {
      console.log("Seeding default reviews...");
      const defaultReviews = [
        {
          customer_name: "Anjali S.",
          review_text: "Such a lovely little store. The staff helped me put together two whole outfits — I left feeling so confident.",
          rating: 5,
          location: "Patan"
        },
        {
          customer_name: "Priya M.",
          review_text: "Easily my favourite boutique in Lalitpur. The pieces are unique and the fit is always spot on.",
          rating: 5,
          location: "Kathmandu"
        },
        {
          customer_name: "Sneha R.",
          review_text: "Beautifully curated. I keep coming back every few weeks because there's always something new.",
          rating: 5,
          location: "Jhamsikhel"
        }
      ];

      const { error: seedReviewsError } = await supabase
        .from("reviews")
        .insert(defaultReviews);

      if (seedReviewsError) {
        console.error("Failed to seed reviews:", seedReviewsError);
      } else {
        console.log("Successfully seeded reviews.");
      }
    }

    // 2. Seed Products
    const { data: existingProducts, error: productsError } = await supabase
      .from("products")
      .select("id");

    if (productsError) {
      console.error("Error checking products for seeding:", productsError);
    } else if (!existingProducts || existingProducts.length === 0) {
      console.log("Seeding default products...");
      const defaultProducts = [
        {
          name: "Warm Clay Peplum Top",
          description: "A beautifully structured modern peplum top in our signature warm clay. Crafted from high-grade cotton-linen blend.",
          price: 2450,
          image_url: productPeplum
        },
        {
          name: "Minimalist Linen Co-ord Set",
          description: "Two-piece matching top and trouser set. Breathable, effortless, and designed for quiet elegance.",
          price: 4800,
          image_url: productCoord
        },
        {
          name: "Blush Pink Summer Silk Dress",
          description: "Flowing silhouette in soft blush pink silk. Airy, lightweight, and perfect for warm summer afternoons.",
          price: 5600,
          image_url: productDress
        }
      ];

      const { error: seedProductsError } = await supabase
        .from("products")
        .insert(defaultProducts);

      if (seedProductsError) {
        console.error("Failed to seed products:", seedProductsError);
      } else {
        console.log("Successfully seeded products.");
      }
    }
  } catch (err) {
    console.error("Unexpected error in database seeding:", err);
  }
}
