import { Pipe } from '@angular/core';
import { PipeTransform } from '../interfaces';

@Pipe({
  name: "checkmumbermany",
})

export class CheckNumberManyPipeComponent implements PipeTransform {
  transform(
    number: number | string,
    sub: string = 's'
  ): string {
    return Number(number) > 1 ? sub : '';
  }
}