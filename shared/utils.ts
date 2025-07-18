export const stripAnsi = (input: string): string => {
  return input.replace(
    // eslint-disable-next-line no-control-regex
    /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g,
    '',
  )
}

/**
 * Appends terminal data to a log array in a way that avoids splitting every character into new lines.
 *
 * @param logArray The ref array where logs are stored.
 * @param data The incoming data chunk.
 */
export function appendTerminalData(
  logArray: string[],
  data: string,
): void {
  const parts = data.split(/\r?\n/)
  const firstPart = parts[0] ?? ''

  if (parts.length === 1) {
    // No newline in this chunk
    const lastIndex = logArray.length - 1
    const lastLine = lastIndex >= 0 ? logArray[lastIndex] : undefined

    if (lastLine !== undefined && !lastLine.endsWith('\n')) {
      logArray[lastIndex] = lastLine + firstPart
    }
    else {
      logArray.push(firstPart)
    }
  }
  else {
    // Has at least one newline
    const lastIndex = logArray.length - 1
    const lastLine = lastIndex >= 0 ? logArray[lastIndex] : undefined

    if (lastLine !== undefined && !lastLine.endsWith('\n')) {
      logArray[lastIndex] = lastLine + firstPart
    }
    else {
      logArray.push(firstPart)
    }

    // Push all remaining parts (note: skip firstPart)
    for (let i = 1; i < parts.length; i++) {
      logArray.push(parts[i] ?? '')
    }
  }
}
