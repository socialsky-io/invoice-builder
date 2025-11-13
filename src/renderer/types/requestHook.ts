export interface RequestHook {
  immediate?: boolean;
  showLoader?: boolean;
  onDone?: () => void;
}
