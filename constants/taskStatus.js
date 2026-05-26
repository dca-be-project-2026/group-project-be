const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

const VALID_TASK_STATUSES = Object.values(TASK_STATUS);

module.exports = { TASK_STATUS, VALID_TASK_STATUSES };
