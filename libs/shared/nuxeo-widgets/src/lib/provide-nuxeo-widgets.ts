import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { WidgetRegistryService, type WidgetDescriptor } from '@agentic-ui/shared/nuxeo-studio';

import { NxTextWidgetComponent } from './nx-text-widget/nx-text-widget.component';
import { NxTextareaWidgetComponent } from './nx-textarea-widget/nx-textarea-widget.component';
import { NxNumberWidgetComponent } from './nx-number-widget/nx-number-widget.component';
import { NxCheckboxWidgetComponent } from './nx-checkbox-widget/nx-checkbox-widget.component';
import { NxToggleWidgetComponent } from './nx-toggle-widget/nx-toggle-widget.component';
import { NxDateWidgetComponent } from './nx-date-widget/nx-date-widget.component';
import { NxDirectoryWidgetComponent } from './nx-directory-widget/nx-directory-widget.component';
import { NxSelectWidgetComponent } from './nx-select-widget/nx-select-widget.component';
import { NxRadioWidgetComponent } from './nx-radio-widget/nx-radio-widget.component';
import { NxUserGroupWidgetComponent } from './nx-user-group-widget/nx-user-group-widget.component';
import { NxBlobWidgetComponent } from './nx-blob-widget/nx-blob-widget.component';
import { NxTagWidgetComponent } from './nx-tag-widget/nx-tag-widget.component';

/**
 * All built-in widget descriptors. Each maps a widget type to an Angular
 * component, a display label, and the Nuxeo field types it supports.
 */
const BUILTIN_WIDGETS: WidgetDescriptor[] = [
  {
    type: 'text',
    component: NxTextWidgetComponent,
    label: 'Text',
    supportedFieldTypes: ['string'],
  },
  {
    type: 'textarea',
    component: NxTextareaWidgetComponent,
    label: 'Textarea',
    supportedFieldTypes: ['string'],
  },
  {
    type: 'number',
    component: NxNumberWidgetComponent,
    label: 'Number',
    supportedFieldTypes: ['integer', 'long', 'float', 'double'],
  },
  {
    type: 'checkbox',
    component: NxCheckboxWidgetComponent,
    label: 'Checkbox',
    supportedFieldTypes: ['boolean'],
  },
  {
    type: 'toggle',
    component: NxToggleWidgetComponent,
    label: 'Toggle',
    supportedFieldTypes: ['boolean'],
  },
  {
    type: 'date',
    component: NxDateWidgetComponent,
    label: 'Date Picker',
    supportedFieldTypes: ['date'],
  },
  {
    type: 'directory',
    component: NxDirectoryWidgetComponent,
    label: 'Vocabulary Suggestion',
    supportedFieldTypes: ['string', 'string[]'],
  },
  {
    type: 'select',
    component: NxSelectWidgetComponent,
    label: 'Select',
    supportedFieldTypes: ['string', 'string[]'],
  },
  {
    type: 'radio',
    component: NxRadioWidgetComponent,
    label: 'Radio Button',
    supportedFieldTypes: ['string'],
  },
  {
    type: 'usergroup',
    component: NxUserGroupWidgetComponent,
    label: 'User / Group Suggestion',
    supportedFieldTypes: ['string', 'string[]'],
  },
  {
    type: 'user',
    component: NxUserGroupWidgetComponent,
    label: 'User Suggestion',
    supportedFieldTypes: ['string', 'string[]'],
  },
  {
    type: 'group',
    component: NxUserGroupWidgetComponent,
    label: 'Group Suggestion',
    supportedFieldTypes: ['string', 'string[]'],
  },
  {
    type: 'blob',
    component: NxBlobWidgetComponent,
    label: 'File Upload',
    supportedFieldTypes: ['blob', 'blob[]'],
  },
  {
    type: 'tag',
    component: NxTagWidgetComponent,
    label: 'Tag Input',
    supportedFieldTypes: ['string[]'],
  },
];

/**
 * Registers all built-in Nuxeo widgets with the WidgetRegistryService
 * at application startup. Call this in your app's providers array:
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideNuxeoWidgets()]
 * });
 * ```
 */
function initNuxeoWidgets(registry: WidgetRegistryService) {
  return () => registry.registerAll(BUILTIN_WIDGETS);
}

export function provideNuxeoWidgets(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      useFactory: initNuxeoWidgets,
      deps: [WidgetRegistryService],
      multi: true,
    },
  ]);
}
