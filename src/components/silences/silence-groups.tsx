import { Group } from "./types"
import { SilenceRow } from "./silence-row";

type SilenceGroupsProps = {
  silenceGroups: Group[]
}

export function SilenceGroups(props: SilenceGroupsProps) {
  const { silenceGroups } = props

  return (
    <>
      {silenceGroups.map(silenceGroup => silenceGroup.silences.length > 0 && (
        <SilenceGroup
          key={silenceGroup.name}
          silenceGroup={silenceGroup}
        />
      ))}
    </>
  )
}

type SilenceGroupProps = {
  silenceGroup: Group
}

function SilenceGroup(props: SilenceGroupProps) {
  const { silenceGroup } = props

  return (
    <>
      <SilenceGroupHeader silenceGroup={silenceGroup} />
      <ul>
        {silenceGroup.silences.map(silence => (
          <li key={`${silenceGroup.name}-${silence.id}`}>
            <SilenceRow silence={silence} />
          </li>
        ))}
      </ul>
    </>
  )
}


function SilenceGroupHeader(props: SilenceGroupProps) {
  const { silenceGroup } = props
  return (
    <div className="sticky z-10 top-0 bg-accent group cursor-pointer h-[40px] px-6 text-sm flex items-center border-b">
      {silenceGroup.name}
    </div>
  )
}
