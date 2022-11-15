import { OpenFormButton } from "../components/OpenFormButton/OpenFormButton";
import { SkeletonItem } from "./SkeletonItem/SkeletonItem";

export function Skeleton() {
  return (
    <>
      <OpenFormButton showingForm={false} switchStatus={() => { }} skeleton />
      <ul class="carousel rounded-box">
        <SkeletonItem />
        <SkeletonItem />
      </ul>
    </>
  );
}
