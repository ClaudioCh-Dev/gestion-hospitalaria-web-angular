import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarDefaultPatient',
})
export class AvatarDefaultPatientPipe implements PipeTransform {
   transform(avatar: string | null | undefined, gender:string | undefined): string {

    if(gender=="FEMALE")
    return avatar || 'avatar/patient-female.jpg';

  return avatar || 'avatar/patient-male.jpg';
  }
}
