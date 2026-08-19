import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { TuiActiveZone, TuiObscured } from '@taiga-ui/cdk';
import {
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiInput,
    TuiOption,
    TuiTitle,
} from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiBadgeNotification, TuiChevron, TuiFade, TuiTabs, TuiBadgedContentComponent, TuiBadgedContent } from '@taiga-ui/kit';
import { TuiNavigation} from '@taiga-ui/layout';
 
	interface ExampleAction {
    readonly description: string;
    readonly title: string;
}

@Component({
    imports: [
    FormsModule,
    TuiAvatar,
    TuiBadgeNotification,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiFade,
    TuiIcon,
    TuiInput,
    TuiNavigation,
    TuiTabs,
    TuiActiveZone,
    TuiDataList,
    TuiDropdown,
    TuiObscured,
    TuiTitle,
    TuiBadgedContent,
],
  selector: 'app-navbar',
  templateUrl: 'navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {


     protected readonly actions: readonly ExampleAction[] = [
        {
            title: 'Create task',
            description: 'Draft a follow-up item for the team',
        },
        {
            title: 'Schedule sync',
            description: 'Find a 30-minute window for everyone',
        },
        {
            title: 'Share update',
            description: 'Post the latest progress to the channel',
        },
    ];
 
    protected readonly open = signal(false);
    protected readonly selected = signal<ExampleAction | null>(null);
 
    protected onClick(): void {
        this.open.update((open) => !open);
    }
 
    protected onObscured(obscured: boolean): void {
        if (obscured) {
            this.open.set(false);
        }
    }
 
    protected onActiveZone(active: boolean): void {
        if (!active) {
            this.open.set(false);
        }
    }
 
    protected onSelect(action: ExampleAction): void {
        this.selected.set(action);
        this.open.set(false);
    }
}
