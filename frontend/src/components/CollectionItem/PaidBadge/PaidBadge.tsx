import styles from "./PaidBadge.module.css";

export function PaidBadge() {
  const className = `badge ml-2 bg-bg ${styles["crazy"]}`;
  
  return <span class={className}>PAID!</span>;
}
