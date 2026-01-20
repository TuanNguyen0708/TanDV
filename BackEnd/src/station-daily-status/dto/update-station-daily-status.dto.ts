import { PartialType } from '@nestjs/mapped-types';
import { CreateStationDailyStatusDto } from './create-station-daily-status.dto';

export class UpdateStationDailyStatusDto extends PartialType(
  CreateStationDailyStatusDto,
) {}
