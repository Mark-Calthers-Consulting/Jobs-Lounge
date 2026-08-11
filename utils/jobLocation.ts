import {
    CUSTOM_JOB_LOCATION_OPTION,
    NIGERIAN_STATE_OPTIONS,
} from '@/constants/nigeria'

export type JobLocationFormValue = {
    option: string
    custom: string
}

const cleanLocation = (value: string) => value.trim().replace(/\s+/g, ' ')
const withoutNigeriaSuffix = (value: string) => value.replace(/,\s*Nigeria$/i, '').trim()

const exactStateAliases = NIGERIAN_STATE_OPTIONS.reduce<Array<[string, string]>>(
    (aliases, { value }) => {
        if (value !== 'Abuja') {
            aliases.push([value, value])
            return aliases
        }
        aliases.push(
            ['Abuja', value],
            ['Federal Capital Territory', value],
            ['Abuja FCT', value],
            ['FCT Abuja', value],
            ['FCT', value],
        )
        return aliases
    },
    [],
)

export const locationToFormValue = (location = ''): JobLocationFormValue => {
    const cleaned = cleanLocation(location)
    if (!cleaned) return { option: '', custom: '' }

    const comparisonValue = withoutNigeriaSuffix(cleaned).toLocaleLowerCase('en-NG')
    const exactState = exactStateAliases.find(([alias]) => (
        alias.toLocaleLowerCase('en-NG') === comparisonValue
    ))
    if (exactState) return { option: exactState[1], custom: '' }

    return { option: CUSTOM_JOB_LOCATION_OPTION, custom: cleaned }
}

export const buildJobLocation = (option = '', custom = '') => {
    if (option === CUSTOM_JOB_LOCATION_OPTION) return cleanLocation(custom)
    return cleanLocation(option)
}
