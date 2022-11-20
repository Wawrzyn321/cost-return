import styles from './SkeletonItem.module.css';
import { ProgressBar } from '../../components/CollectionItem/Entry/PogressBar/ProgressBar';
import { BsArrowClockwise } from 'solid-icons/bs';

export function SkeletonItem() {
  const SkeletonPanel = () => (
    <div class="collapse collapse-arrow border border-base-300 background-page-color rounded-box mt-4">
      <input type="checkbox" />
      <div class="collapse-title text-l font-small"></div>
      <div class="collapse-content"></div>
    </div>
  );

  return (
    <>
      <li class="carousel-item block border collection-item pointer-events-none">
        <div
          class={`absolute grid place-content-center ${styles['loading-wrapper']}`}
        >
          <BsArrowClockwise
            class={`opacity-50 ${styles['loading']}`}
            size={70}
          />
        </div>
        <header>
          <h1></h1>
          <div
            class="grid bg-ng gap-4 place-items-center"
            style={{ 'grid-template-columns': '1fr 1fr' }}
          >
            <p class="text-2xl text-right"></p>
            <button class="btn btn-xs rounded-box h-8 opacity-75">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </button>
          </div>
          <ProgressBar value={0} max={1} />
        </header>

        <SkeletonPanel />
        <SkeletonPanel />
        <SkeletonPanel />
      </li>
    </>
  );
}
