import { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../infrastructure/storage/auth-store';
import { useTenantStore } from '../../infrastructure/storage/tenant-store';
import { useAuthPermissions } from '../../infrastructure/hooks/use-auth-permissions.hook';
import { ServiceContainer } from '../../infrastructure/services/service-container';
import { Workflow, WorkflowStep } from '../../shared/types';
import { getErrorMessage } from '../../shared/utils/error-handler';
import { sanitizeText } from '../../shared/utils/sanitize';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Workflow as WorkflowIcon, Plus, Pencil, Trash2, CheckCircle2, XCircle, FileText, MoreVertical } from 'lucide-react';
import { useToast } from '../../shared/hooks/use-toast';
import { Skeleton } from '../components/ui/skeleton';
import { Textarea } from '../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

type WorkflowStatus = 'active' | 'inactive' | 'draft';
type WorkflowType = 'condition' | 'voucher';

interface WorkflowStepForm {
  stepNumber: number;
  name: string;
  description: string;
  actionType: 'approval' | 'notification' | 'calculation' | 'validation';
  config: Record<string, any>;
}

export default function WorkflowsPage() {
  const { user } = useAuthStore();
  const { selectedTenant } = useTenantStore();
  const { toast } = useToast();
  const { isSuperAdmin, isAdmin } = useAuthPermissions();
  
  const adminStatus = useMemo(() => ({
    isSuperAdmin: isSuperAdmin(),
    isAdmin: isAdmin()
  }), [user?.roles]);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'condition' as WorkflowType,
    status: 'draft' as WorkflowStatus,
    steps: [] as WorkflowStepForm[],
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    type: 'condition' as WorkflowType,
    status: 'draft' as WorkflowStatus,
    steps: [] as WorkflowStepForm[],
  });

  const serviceContainer = ServiceContainer.getInstance();
  const getWorkflowsUseCase = serviceContainer.workflows.getWorkflows;
  const getWorkflowUseCase = serviceContainer.workflows.getWorkflow;
  const createWorkflowUseCase = serviceContainer.workflows.createWorkflow;
  const updateWorkflowUseCase = serviceContainer.workflows.updateWorkflow;
  const deleteWorkflowUseCase = serviceContainer.workflows.deleteWorkflow;

  useEffect(() => {
    loadData();
  }, []);

  if (adminStatus.isSuperAdmin && !selectedTenant) {
    return <Navigate to="/tenants" replace />;
  }
 
  if (!adminStatus.isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  const loadData = async () => {
    try {
      const workflowsData = await getWorkflowsUseCase.execute();
      setWorkflows(Array.isArray(workflowsData) ? workflowsData : []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWorkflowUseCase.execute(formData);
      setShowCreateForm(false);
      setFormData({ 
        name: '', 
        description: '', 
        type: 'condition', 
        status: 'draft', 
        steps: [] 
      });
      loadData();
      toast({
        title: 'Success',
        description: 'Workflow created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (workflowId: string) => {
    try {
      const workflow = await getWorkflowUseCase.execute(workflowId);
      setEditFormData({
        name: workflow.name,
        description: workflow.description || '',
        type: workflow.type,
        status: workflow.status,
        steps: workflow.steps.map((step: WorkflowStep) => ({
          stepNumber: step.stepNumber,
          name: step.name,
          description: step.description || '',
          actionType: step.actionType,
          config: step.config,
        })),
      });
      setSelectedWorkflow(workflow);
      setShowEditForm(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflow) return;
    try {
      await updateWorkflowUseCase.execute(selectedWorkflow.id, editFormData);
      setShowEditForm(false);
      setSelectedWorkflow(null);
      setEditFormData({ 
        name: '', 
        description: '', 
        type: 'condition', 
        status: 'draft', 
        steps: [] 
      });
      loadData();
      toast({
        title: 'Success',
        description: 'Workflow updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteWorkflowId) return;
    try {
      await deleteWorkflowUseCase.execute(deleteWorkflowId);
      setDeleteWorkflowId(null);
      loadData();
      toast({
        title: 'Success',
        description: 'Workflow deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const addStepToForm = () => {
    const newStep: WorkflowStepForm = {
      stepNumber: formData.steps.length + 1,
      name: '',
      description: '',
      actionType: 'approval',
      config: {},
    };
    setFormData({ ...formData, steps: [...formData.steps, newStep] });
  };

  const addStepToEditForm = () => {
    const newStep: WorkflowStepForm = {
      stepNumber: editFormData.steps.length + 1,
      name: '',
      description: '',
      actionType: 'approval',
      config: {},
    };
    setEditFormData({ ...editFormData, steps: [...editFormData.steps, newStep] });
  };

  const removeStepFromForm = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ 
      ...formData, 
      steps: newSteps.map((step, i) => ({ ...step, stepNumber: i + 1 })) 
    });
  };

  const removeStepFromEditForm = (index: number) => {
    const newSteps = editFormData.steps.filter((_, i) => i !== index);
    setEditFormData({ 
      ...editFormData, 
      steps: newSteps.map((step, i) => ({ ...step, stepNumber: i + 1 })) 
    });
  };

  const updateStepInForm = (index: number, field: keyof WorkflowStepForm, value: any) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStepInEditForm = (index: number, field: keyof WorkflowStepForm, value: any) => {
    const newSteps = [...editFormData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setEditFormData({ ...editFormData, steps: newSteps });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      active: { variant: 'default', icon: CheckCircle2 },
      inactive: { variant: 'secondary', icon: XCircle },
      draft: { variant: 'outline', icon: FileText },
    };
    
    const { variant, icon: Icon } = variants[status] || variants.draft;
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'condition' ? 'default' : 'secondary'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const WorkflowForm = ({ 
    data, 
    setData, 
    onSubmit, 
    isEdit = false 
  }: { 
    data: typeof formData; 
    setData: (data: typeof formData) => void; 
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
  }) => (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={isEdit ? 'edit-name' : 'name'}>Name *</Label>
            <Input
              id={isEdit ? 'edit-name' : 'name'}
              value={data.name}
              onChange={(e) => setData({ ...data, name: sanitizeText(e.target.value) })}
              placeholder="Enter workflow name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={isEdit ? 'edit-description' : 'description'}>Description</Label>
            <Textarea
              id={isEdit ? 'edit-description' : 'description'}
              value={data.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData({ ...data, description: sanitizeText(e.target.value) })}
              placeholder="Enter workflow description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={isEdit ? 'edit-type' : 'type'}>Type *</Label>
              <Select
                value={data.type}
                onValueChange={(value: WorkflowType) => setData({ ...data, type: value })}
              >
                <SelectTrigger id={isEdit ? 'edit-type' : 'type'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="condition">Condition</SelectItem>
                  <SelectItem value="voucher">Voucher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={isEdit ? 'edit-status' : 'status'}>Status *</Label>
              <Select
                value={data.status}
                onValueChange={(value: WorkflowStatus) => setData({ ...data, status: value })}
              >
                <SelectTrigger id={isEdit ? 'edit-status' : 'status'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">Workflow Steps</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => isEdit ? addStepToEditForm() : addStepToForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {data.steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              No steps added yet. Click &quot;Add Step&quot; to create workflow steps.
            </div>
          ) : (
            <div className="space-y-4">
              {data.steps.map((step, index) => (
                <Card key={`step-${step.stepNumber}-${index}`} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Step {step.stepNumber}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => isEdit ? removeStepFromEditForm(index) : removeStepFromForm(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      <Label htmlFor={`step-name-${index}`}>Step Name *</Label>
                      <Input
                        id={`step-name-${index}`}
                        value={step.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          isEdit 
                            ? updateStepInEditForm(index, 'name', sanitizeText(e.target.value))
                            : updateStepInForm(index, 'name', sanitizeText(e.target.value))
                        }
                        placeholder="Enter step name"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`step-description-${index}`}>Step Description</Label>
                      <Textarea
                        id={`step-description-${index}`}
                        value={step.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          isEdit 
                            ? updateStepInEditForm(index, 'description', sanitizeText(e.target.value))
                            : updateStepInForm(index, 'description', sanitizeText(e.target.value))
                        }
                        placeholder="Enter step description"
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`step-action-${index}`}>Action Type *</Label>
                      <Select
                        value={step.actionType}
                        onValueChange={(value: any) => 
                          isEdit 
                            ? updateStepInEditForm(index, 'actionType', value)
                            : updateStepInForm(index, 'actionType', value)
                        }
                      >
                        <SelectTrigger id={`step-action-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approval">Approval</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="calculation">Calculation</SelectItem>
                          <SelectItem value="validation">Validation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t px-6 py-4 bg-muted/50">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => isEdit ? setShowEditForm(false) : setShowCreateForm(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Manage workflows for conditions and vouchers</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle>Create Workflow</DialogTitle>
              <DialogDescription>
                Add a new workflow to manage conditions or vouchers
              </DialogDescription>
            </DialogHeader>
            <WorkflowForm 
              data={formData} 
              setData={setFormData} 
              onSubmit={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {workflows.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WorkflowIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first workflow
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{workflow.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {workflow.description || 'No description'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(workflow.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteWorkflowId(workflow.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {getTypeBadge(workflow.type)}
                  {getStatusBadge(workflow.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Steps</span>
                    <Badge variant="outline">{workflow.steps.length}</Badge>
                  </div>
                  
                  {workflow.steps.length > 0 && (
                    <div className="space-y-1">
                      {workflow.steps.slice(0, 3).map((step) => (
                        <div key={step.id} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {step.stepNumber}
                          </span>
                          <span className="truncate">{step.name}</span>
                        </div>
                      ))}
                      {workflow.steps.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-7">
                          +{workflow.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Created {new Date(workflow.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>
              Update workflow details and steps
            </DialogDescription>
          </DialogHeader>
          <WorkflowForm 
            data={editFormData} 
            setData={setEditFormData} 
            onSubmit={handleUpdate}
            isEdit
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteWorkflowId} onOpenChange={() => setDeleteWorkflowId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow
              and all its associated steps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
