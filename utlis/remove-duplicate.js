// removes duplicate line statuses. Often they are duplicate status objects with
// different statusSeverityDescriptions but the same reason.
const removeDuplicate = (result) => {
  return result.map((line) => {
    const newStatuses = line.lineStatuses.reduce((unique, line) => {
      const hasDup = !!unique.filter((obj) => obj.reason === line.reason).length;

      if (!hasDup) unique.push(line);
      return unique;
    }, []);

    line.lineStatuses = newStatuses;

    return line;
  });
};

module.exports = {removeDuplicate};
