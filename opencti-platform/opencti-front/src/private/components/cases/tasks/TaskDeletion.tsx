import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { graphql } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import { useFormatter } from '../../../../components/i18n';
import Security from '../../../../utils/Security';
import Transition from '../../../../components/Transition';
import { KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';
import useDeletion from '../../../../utils/hooks/useDeletion';
import { deleteNode } from '../../../../utils/store';
import { CaseTasksLinesQuery$variables } from './__generated__/CaseTasksLinesQuery.graphql';
import useApiMutation from '../../../../utils/hooks/useApiMutation';

const taskDeletionDeleteMutation = graphql`
  mutation TaskDeletionDeleteMutation($id: ID!) {
    taskDelete(id: $id)
  }
`;

const TaskDeletion = ({
  id,
  objectId,
  paginationOptions,
}: {
  id: string;
  objectId?: string;
  paginationOptions?: CaseTasksLinesQuery$variables;
}) => {
  const { t_i18n } = useFormatter();
  const navigate = useNavigate();
  const deleteSuccessMessage = t_i18n('', {
    id: '... successfully deleted',
    values: { entity_type: t_i18n('entity_Task') },
  });
  const [commit] = useApiMutation(
    taskDeletionDeleteMutation,
    undefined,
    { successMessage: deleteSuccessMessage },
  );
  const handleClose = () => {};
  const {
    deleting,
    handleOpenDelete,
    displayDelete,
    handleCloseDelete,
    setDeleting,
  } = useDeletion({ handleClose });
  const submitDelete = () => {
    setDeleting(true);
    commit({
      variables: {
        id,
      },
      updater: (store) => {
        if (paginationOptions) {
          deleteNode(store, 'Pagination_tasks', paginationOptions, id);
        }
      },
      onCompleted: () => {
        setDeleting(false);
        handleClose();
        if (objectId) {
          handleCloseDelete();
        } else {
          navigate('/dashboard/cases/tasks');
        }
      },
    });
  };

  return (
    <div style={{ margin: 0 }}>
      <Security needs={[KNOWLEDGE_KNUPDATE_KNDELETE]}>
        <Button
          color="error"
          variant="contained"
          onClick={handleOpenDelete}
          disabled={deleting}
          sx={{ marginTop: 2 }}
        >
          {t_i18n('Delete')}
        </Button>
      </Security>
      <Dialog
        slotProps={{ paper: { elevation: 1 } }}
        open={displayDelete}
        keepMounted={true}
        slots={{ transition: Transition }}
        onClose={handleCloseDelete}
      >
        <DialogContent>
          <DialogContentText>
            {t_i18n('Do you want to delete this task?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            {t_i18n('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDelete} disabled={deleting}>
            {t_i18n('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskDeletion;
