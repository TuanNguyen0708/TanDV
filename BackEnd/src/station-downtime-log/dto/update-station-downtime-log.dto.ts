import { PartialType } from '@nestjs/mapped-types';
import { CreateStationDowntimeLogDto } from './create-station-downtime-log.dto';

export class UpdateStationDowntimeLogDto extends PartialType(
  CreateStationDowntimeLogDto,
) {}
