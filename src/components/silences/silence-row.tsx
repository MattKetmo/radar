import { useAlerts } from "@/contexts/alerts";
import { Silence } from "@/types/alertmanager";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { matchAlerts } from "./utils";
import { cn } from "@/lib/utils";

function paramsWithSilence(id: string) {
  const params = new URLSearchParams(window.location.search)
  params.set('silence', id)
  return params.toString()
}

export function SilenceRow({ silence, cluster }: { silence: Silence, cluster: string }) {
  const { alerts } = useAlerts()
  const matchedAlerts = silence ? matchAlerts(silence, alerts[cluster ?? ''] || []) : []

  return (
    <Link
      href={`?${paramsWithSilence(silence.id)}`}
      className="flex gap-2 xl:gap-4 items-center px-6 h-[45px] border-b group cursor-pointer"
    >
      <div className='shrink-0'>
        <div className={`w-3 h-3 rounded-full ${getColorClass(silence.endsAt)}`} />
      </div>
      <div className="text-sm max-w-[300px] font-medium truncate group-hover:text-blue-500 dark:group-hover:text-blue-300">
        {silence.comment}
      </div>
      <div className="text-xs text-muted-foreground truncate hidden sm:block">
        {silence.createdBy}
      </div>
      <div className="grow" />
      <SilenceMatchers silence={silence} />
      <time
        className="text-right text-xs shrink-0 text-nowrap"
        dateTime={silence.endsAt}
        title={silence.endsAt}
      >
        Expires in {formatDistanceToNowStrict(new Date(silence.endsAt), {})}
      </time>
      <div
        title={`${matchedAlerts.length} alerts matched`}
        className={cn(
          "text-xs bg-secondary text-secondary-foreground w-5 h-5 rounded-sm flex items-center justify-center",
          matchedAlerts.length > 0 && 'bg-destructive text-destructive-foreground'
        )}>
        {matchedAlerts.length}
      </div>
    </Link>
  )
}

function SilenceMatchers({ silence }: { silence: Silence }) {
  const matchers = silence.matchers.map((matcher) => {
    const operator = matcher.isRegex ? (matcher.isEqual ? '=~' : '!~') : (matcher.isEqual ? '=' : '!=');
    return `${matcher.name}${operator}${matcher.value}`
  })

  return (
    <div className="shrink truncate relative -mr-[0.2rem] hidden sm:block sm:max-w-[45%] md:max-w-auto">
      {/* {labels.length > 2 && (
        <div className="absolute top-0 right-0 bottom-0 w-[30px] bg-gradient-to-r from-transparent to-background" />
      )} */}
      <ul className="flex items-center gap-1">
        {matchers.map((matcher, i) => (
          <li key={i}>
            <button
              className="text-xs bg-secondary px-2 py-1 items-center rounded-sm gap-1 flex hover:border-primary"
            // className="text-xs border px-2  items-center rounded-full gap-2 flex hover:border-primary"
            >
              {/* {key === 'namespace' && (
                <span className="h-2 w-2 block rounded-full" style={{backgroundColor: stringToColor(value)}}/>
              )} */}
              <div className="shrink-0 truncate text-primary max-w-[230px]">
                {matcher}
              </div>
            </button>
          </li>
        ))}
        {/* <li>
          <span className="text-xs border px-2 py-1 rounded-full flex gap-1 hover:border-primary">
            +1
          </span>
        </li> */}
      </ul>
    </div>
  )
}

function getColorClass(endsAt: string) {
  const endTime = new Date(endsAt).getTime();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;

  if (endTime - now < oneHour) {
    return 'bg-emerald-300';
  } else if (endTime - now > 7 * oneDay) {
    return 'bg-purple-400';
  } else if (endTime - now > oneDay) {
    return 'bg-blue-400';
  } else {
    return 'bg-teal-300';
  }
}
