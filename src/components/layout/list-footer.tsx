"use client";

type ListFooterProps = {
  count: number;
  loading: boolean;
  onRefresh: () => void;
  label: string;
};

export function ListFooter({ count, loading, onRefresh, label }: ListFooterProps) {
  return (
    <footer className="my-6 text-xs flex gap-2 justify-center text-muted-foreground">
      {loading || (
        <>
          <span>
            Total of{" "}
            <span className="font-semibold">
              {count} {label}
            </span>{" "}
            displayed.
          </span>
          <button
            disabled={loading}
            onClick={() => onRefresh()}
            className="font-semibold hover:underline underline-offset-2"
          >
            Refresh
          </button>
        </>
      )}
    </footer>
  );
}
