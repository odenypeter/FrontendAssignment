import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from 'app/common/interface/appstate';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { WorkflowLevel2 } from 'app/common/interface/workflowlevel2';
import * as moment from 'moment';
import { WorkflowLevel2Actions } from 'app/common/actions/workflowLevel2.actions';


@Component({
  selector: 'app-workflowlevel1',
  templateUrl: './workflowlevel1.component.html',
  styleUrls: ['./workflowlevel1.component.scss']
})
export class Workflowlevel1Component implements OnInit, OnDestroy {

  showHide: false;
  hideDiv = {};
  confirm_delete;

  projectForm: FormGroup;
  public programs = [];
  public projects = [];

  private stores;
  private storeSubscription: Subscription;
  isConnected: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    protected workflowLevel2Actions: WorkflowLevel2Actions,
  ) {

    this.isConnected = Observable.merge(
      Observable.of(navigator.onLine),
      Observable.fromEvent(window, 'online').map(() => true),
      Observable.fromEvent(window, 'offline').map(() => false));

    this.stores = Observable.combineLatest(
      this.store.select('workflowLevel1'),
      this.store.select('workflowLevel2'),
    );
    this.projectForm = this.fb.group({
      name: ['', Validators.required ],
      expected_start_date: [''],
      expected_end_date: ['']
    });
  this.hideDiv = {};
  }

  ngOnInit() {

    this.storeSubscription = this.stores.subscribe(data => setTimeout(() => {
      this.programs = data[0];
      this.projects = data[1];

      if (this.programs) {
        for (const program of this.programs){
          if (this.projects) {
            try {
                program.projects = [];
                for (const project of this.projects) {
                  if (project.workflowlevel1 === program.url ) {
                    program.projects.push(project);

                  }
                }
            } catch (error) {

            }
          }

        }
      }

      console.log(this.programs);
      console.log(this.projects);
    }));
  }
  addWorkflowLevel2(projectActivity, program) {
    if (this.projectForm.valid) {

      projectActivity.workflowlevel1 = program;
      // tslint:disable-next-line:max-line-length
      projectActivity.level2_uuid = '' + Math.floor(Math.random() * 90000) + 10000;
      projectActivity.expected_start_date = (projectActivity.expected_start_date === '' ? null : moment(projectActivity.expected_start_date, 'DD.MM.YYYY').format('YYYY-MM-DDThh:mm:ssZ'));

      // tslint:disable-next-line:max-line-length
      projectActivity.expected_end_date = (projectActivity.expected_end_date === '' ? null : moment(projectActivity.expected_end_date, 'DD.MM.YYYY').format('YYYY-MM-DDThh:mm:ssZ'));
      console.log(projectActivity)

      const action = this.workflowLevel2Actions.createWorkflowsLevel2(projectActivity);
      this.store.dispatch(action)
      alert("A new Activity was submitted!!");
    }
  }

  getProject(item) {
    if (item) {
      try {
        const project = this.projects.find(x => x.url === item);
        return project;
      } catch (err) {
        return null;
      }
    }
  }

  deleteWorflowLevel2(object) {
    let confirm_delete = confirm('Are you sure you want to delete activity #'+object.id+ '?');
    if (confirm_delete === true) {
      const action = this.workflowLevel2Actions.deleteWorkflowLevel2(object);
      this.store.dispatch(action);

      this.projects = this.projects.filter(x => x.id !== object.id);
      this.confirm_delete = 'You have successfully deleted Activity #' + object.id + '.';
    }
  }
  ngOnDestroy(): void {
    this.stores.unsubscribe();
  }

}
