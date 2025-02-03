type Props = {
  silenceCount: number;
  loading: boolean;
  refreshSilences: () => void;
}

export function Footer(props: Props) {
  const { silenceCount, loading, refreshSilences } = props

  return (
    <footer className="my-6 text-xs flex gap-2 justify-center text-muted-foreground">
      {loading && (
        <span>loading...</span>
      ) || (
          <>
            <span>
              Total of <span className="font-semibold">{silenceCount} silences</span> displayed.
            </span>
            <button
              disabled={loading}
              onClick={() => refreshSilences()}
              className="font-semibold hover:underline underline-offset-2"
            >
              Refresh
            </button>
          </>
        )}
    </footer>
  );
}
