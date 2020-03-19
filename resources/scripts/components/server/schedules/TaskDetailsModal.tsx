import React, { useEffect } from 'react';
import Modal from '@/components/elements/Modal';
import { Task } from '@/api/server/schedules/getServerSchedules';
import { Form, Formik, Field as FormikField, FormikHelpers } from 'formik';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import createOrUpdateScheduleTask from '@/api/server/schedules/createOrUpdateScheduleTask';
import { httpErrorToHuman } from '@/api/http';
import Field from '@/components/elements/Field';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import FlashMessageRender from '@/components/FlashMessageRender';

interface Props {
    scheduleId: number;
    // If a task is provided we can assume we're editing it. If not provided,
    // we are creating a new one.
    task?: Task;
    onDismissed: (task: Task | undefined | void) => void;
}

interface Values {
    action: string;
    payload: string;
    timeOffset: string;
}

export default ({ task, scheduleId, onDismissed }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, addError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    useEffect(() => {
        clearFlashes('schedule:task');
    }, []);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('schedule:task');
        createOrUpdateScheduleTask(uuid, scheduleId, task?.id, values)
            .then(task => onDismissed(task))
            .catch(error => {
                console.error(error);
                setSubmitting(false);
                addError({ message: httpErrorToHuman(error), key: 'schedule:task' });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                action: task?.action || 'command',
                payload: task?.payload || '',
                timeOffset: task?.timeOffset.toString() || '0',
            }}
        >
            {({ values, isSubmitting }) => (
                <Modal
                    visible={true}
                    appear={true}
                    onDismissed={() => onDismissed()}
                    showSpinnerOverlay={isSubmitting}
                >
                    <FlashMessageRender byKey={'schedule:task'} className={'mb-4'}/>
                    <Form className={'m-0'}>
                        <h3 className={'mb-6'}>Edit Task</h3>
                        <div className={'flex'}>
                            <div className={'mr-2'}>
                                <label className={'input-dark-label'}>Action</label>
                                <FormikField as={'select'} name={'action'} className={'input-dark'}>
                                    <option value={'command'}>Send command</option>
                                    <option value={'power'}>Send power action</option>
                                </FormikField>
                            </div>
                            <div className={'flex-1'}>
                                <Field
                                    name={'payload'}
                                    label={'Payload'}
                                    description={
                                        values.action === 'command'
                                            ? 'The command to send to the server when this task executes.'
                                            : 'The power action to send when this task executes. Options are "start", "stop", "restart", or "kill".'
                                    }
                                />
                            </div>
                        </div>
                        <div className={'mt-6'}>
                            <Field
                                name={'timeOffset'}
                                label={'Time offset (in seconds)'}
                                description={'The amount of time to wait after the previous task executes before running this one. If this is the first task on a schedule this will not be applied.'}
                            />
                        </div>
                        <div className={'flex justify-end mt-6'}>
                            <button type={'submit'} className={'btn btn-primary btn-sm'}>
                                {task ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};
