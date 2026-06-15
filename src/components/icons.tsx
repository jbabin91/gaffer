// App code uses `Icons.<name>` rather than importing heroicons directly, so the
// icon set or library can be swapped in one place.
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  MoonIcon,
  PencilSquareIcon,
  PlusIcon,
  SunIcon,
  TrashIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export const Icons = {
  add: PlusIcon,
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  calendar: CalendarIcon,
  check: CheckIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  close: XMarkIcon,
  edit: PencilSquareIcon,
  moon: MoonIcon,
  remove: MinusIcon,
  search: MagnifyingGlassIcon,
  selector: ChevronUpDownIcon,
  sun: SunIcon,
  trash: TrashIcon,
  trendingUp: ArrowTrendingUpIcon,
  trophy: TrophyIcon,
  user: UserIcon,
  users: UsersIcon,
};

export type Icon = (typeof Icons)[keyof typeof Icons];
