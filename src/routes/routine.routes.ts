import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validator } from '../middlewares/validator.middleware.js';
import { ValidationSource } from '../helpers/validator.js';
import routineSchema from '../schema/routine.schema.js';
import routineController from '../controllers/routine.controller.js';

const router = Router();

router.use(protect);

router.get(
    '/:childId',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    routineController.getRoutine,
);

router.put(
    '/:childId',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    validator(routineSchema.RoutineUpsert, ValidationSource.BODY),
    routineController.putRoutine,
);

router.post(
    '/:childId/items',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    validator(routineSchema.RoutineItemCreate, ValidationSource.BODY),
    routineController.createItem,
);

router.patch(
    '/:childId/items/:itemId',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    validator(routineSchema.ItemParams, ValidationSource.PARAM),
    validator(routineSchema.RoutineItemUpdate, ValidationSource.BODY),
    routineController.updateItem,
);

router.delete(
    '/:childId/items/:itemId',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    validator(routineSchema.ItemParams, ValidationSource.PARAM),
    routineController.deleteItem,
);

router.get(
    '/:childId/day',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    validator(routineSchema.DayQuery, ValidationSource.QUERY),
    routineController.getDay,
);

router.put(
    '/:childId/checkins',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    validator(routineSchema.CheckInUpsert, ValidationSource.BODY),
    routineController.upsertCheckIn,
);

router.get(
    '/:childId/checkins',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    validator(routineSchema.CheckInRangeQuery, ValidationSource.QUERY),
    routineController.listCheckIns,
);

router.get(
    '/:childId/progress',
    validator(routineSchema.ChildParams, ValidationSource.PARAM),
    validator(routineSchema.CheckInRangeQuery, ValidationSource.QUERY),
    routineController.getProgress,
  );

export default router;

