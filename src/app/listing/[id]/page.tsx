import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BuyButton from "@/components/BuyButton";
import RatingStars from "@/components/RatingStars";

type ListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Seller = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  profile_id: string | null;
  last_seen: string | null;
};

type Review = {
  rating: number;
};

function getSellerStatus(lastSeen: string | null) {
  if (!lastSeen) {
    return {
      online: false,
      text: "Не был в сети",
    };
  }

  const lastSeenTime = new Date(lastSeen).getTime();
  const now = Date.now();

  const diffMinutes = Math.floor(
    (now - lastSeenTime) / 60000
  );

  if (diffMinutes <= 5) {
    return {
      online: true,
      text: "В сети",
    };
  }

  if (diffMinutes < 60) {
    return {
      online: false,
      text: `Был в сети ${diffMinutes} мин. назад`,
    };
  }

  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);

    return {
      online: false,
      text: `Был в сети ${hours} ч. назад`,
    };
  }

  return {
    online: false,
    text: `Был в сети ${new Date(lastSeen).toLocaleDateString(
      "ru-RU"
    )}`,
  };
}

function getReviewWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return "отзыв";
  }

  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  ) {
    return "отзыва";
  }

  return "отзывов";
}

export default async function ListingPage({
  params,
}: ListingPageProps) {
  const { id } = await params;

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(
      "id, seller_id, game, category, title, description, price, created_at"
    )
    .eq("id", id)
    .single();

  if (listingError || !listing) {
    console.error(
      "Ошибка загрузки объявления:",
      listingError
    );

    notFound();
  }

  const { data: seller, error: sellerError } = await supabase
    .from("profiles")
    .select(
      "id, username, avatar_url, profile_id, last_seen"
    )
    .eq("id", listing.seller_id)
    .single<Seller>();

  if (sellerError) {
    console.error(
      "Ошибка загрузки продавца:",
      sellerError
    );
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("seller_id", listing.seller_id);

  if (reviewsError) {
    console.error(
      "Ошибка загрузки отзывов:",
      reviewsError
    );
  }

  const sellerReviews = (reviews ?? []) as Review[];

  const validRatings = sellerReviews
    .map((review) => Number(review.rating))
    .filter(
      (rating) =>
        Number.isFinite(rating) &&
        rating >= 1 &&
        rating <= 5
    );

  const reviewCount = validRatings.length;

  const averageRating =
    reviewCount > 0
      ? validRatings.reduce(
          (sum, rating) => sum + rating,
          0
        ) / reviewCount
      : 0;

  const sellerStatus = getSellerStatus(
    seller?.last_seen ?? null
  );

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex text-sm text-primary hover:underline"
      >
        ← Вернуться на главную
      </Link>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="flex h-64 items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-card text-7xl">
          🎮
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              {listing.category}
            </span>

            <span className="text-sm text-text-secondary">
              {listing.game}
            </span>
          </div>

          <h1 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            {listing.title}
          </h1>

          {listing.description && (
            <div className="mb-8">
              <h2 className="mb-2 text-lg font-semibold">
                Описание
              </h2>

              <p className="whitespace-pre-wrap text-text-secondary">
                {listing.description}
              </p>
            </div>
          )}

          <div className="mb-8 rounded-2xl border border-border bg-background/50 p-5">
            <h2 className="mb-5 text-lg font-semibold">
              Продавец
            </h2>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-white ring-2 ring-border">
                  {seller?.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt={`Аватар ${
                        seller.username ?? "продавца"
                      }`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (seller?.username ?? "U")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/profile/${listing.seller_id}`}
                      className="text-lg font-semibold text-foreground transition hover:text-primary"
                    >
                      {seller?.username ?? "Продавец"}
                    </Link>

                    <span
                      className={`inline-flex items-center gap-1.5 text-sm ${
                        sellerStatus.online
                          ? "text-green-400"
                          : "text-text-secondary"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          sellerStatus.online
                            ? "bg-green-400"
                            : "bg-text-secondary"
                        }`}
                      />

                      {sellerStatus.text}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-text-secondary">
                    ID профиля:{" "}
                    <span className="font-medium text-foreground">
                      {seller?.profile_id ?? "—"}
                    </span>
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <RatingStars
                      rating={averageRating}
                      size="sm"
                    />

                    {reviewCount > 0 ? (
                      <>
                        <span className="text-sm font-semibold text-foreground">
                          {averageRating.toFixed(1)}
                        </span>

                        <span className="text-sm text-text-secondary">
                          · {reviewCount}{" "}
                          {getReviewWord(reviewCount)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-text-secondary">
                        Нет оценок
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                href={`/chat?user=${listing.seller_id}`}
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
              >
                💬 Написать продавцу
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-text-secondary">
                Цена
              </p>

              <p className="text-3xl font-bold text-foreground">
                {Number(listing.price).toLocaleString(
                  "ru-RU"
                )}{" "}
                ₽
              </p>
            </div>

            <BuyButton
              listingId={listing.id}
              sellerId={listing.seller_id}
              amount={Number(listing.price)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}