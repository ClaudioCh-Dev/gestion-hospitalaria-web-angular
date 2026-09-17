import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarDefaultDoctor',
})
export class AvatarDefaultDoctorPipe implements PipeTransform {
  transform(avatar: string | null | undefined): string {
    return avatar || 'avatar/doctor.jpg';
  }
}
