import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeRange',
})
export class TimeRangePipe implements PipeTransform {

  transform(
    start: string | null | undefined,
    end: string | null | undefined,
  ): string {
    if (!start || !end) {
      return '--:--';
    }

    return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
  }
}