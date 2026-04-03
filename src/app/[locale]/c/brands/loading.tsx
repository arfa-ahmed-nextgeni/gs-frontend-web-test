import { BrandsAlphabetNavSkeleton } from "@/components/category/brands-section/skeletons/brands-alphabet-nav-skeleton";
import { BrandsHeaderSkeleton } from "@/components/category/brands-section/skeletons/brands-header-skeleton";
import { BrandsLetterGroupSkeleton } from "@/components/category/brands-section/skeletons/brands-letter-group-skeleton";
import Container from "@/components/shared/container";

export default function BrandsPageLoading() {
  return (
    <>
      <BrandsHeaderSkeleton />
      <Container className="my-7.5 lg:gap-7.5 flex flex-row-reverse items-start gap-2.5 lg:flex-col lg:items-center">
        <BrandsAlphabetNavSkeleton />
        <BrandsLetterGroupSkeleton />
      </Container>
    </>
  );
}
