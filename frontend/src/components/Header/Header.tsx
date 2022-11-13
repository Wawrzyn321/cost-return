import { useAuth0 } from "@rturnq/solid-auth0";
import styles from "./Header.module.css";
import { useAuthData } from "../../auth/AuthDataContext";
import { AnimatedCashback } from "../AnimatedCashback/AnimatedCashback";

export function Header() {
  const { user } = useAuth0()!;
  const { state: authDataState } = useAuthData()!;
  const { logout } = useAuth0()!;

  const userInitials = () => user()?.given_name[0] + user()?.family_name[0];

  return (
    <nav class="flex justify-between w-screen color-page">
      <div class={styles["header"]}>
        <AnimatedCashback />
        Cost-Return
      </div>
      <p class={styles["state"]}>
        {authDataState() ? (
          authDataState()
        ) : (
          <div class="flex">
            <button class="has-underline" onClick={logout}>
              Logout
            </button>
            <div class="avatar placeholder ml-2">
              <div class="bg-secondary text-neutral-content rounded-full w-8">
                <span class="text-xs">{userInitials()}</span>
              </div>
            </div>
          </div>
        )}
      </p>
    </nav>
  );
}
