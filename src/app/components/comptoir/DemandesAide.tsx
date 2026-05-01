import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Calendar, User, Filter, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { BoutonRetourHeader } from '../shared/BoutonRetour';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface DemandesAideProps {
  onNavigate: (view: string, id?: string) => void;
  aidRequests: AidRequest[];
  setAidRequests: React.Dispatch<React.SetStateAction<AidRequest[]>>;
}

interface AidRequest {
  id: number;
  beneficiaire: string;
  beneficiaireId: string;
  type: string;
  quantite: number;
  dateRequested: string;
  status: 'pending' | 'approved' | 'rejected';
  processedDate?: string;
  processedBy?: string;
  notes?: string;
  rejectionReason?: string;
  estimatedValue?: number;
  appointmentDate?: string;
  appointmentTime?: string;
}

export function DemandesAide({ onNavigate, aidRequests, setAidRequests }: DemandesAideProps) {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AidRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-[#FFC107] hover:bg-[#FFC107] text-[#333333]">
            <Clock className="w-3 h-3 mr-1" />
            {t('comptoir.pending')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-[#4CAF50] hover:bg-[#4CAF50]">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('comptoir.approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-[#DC3545] hover:bg-[#DC3545]">
            <XCircle className="w-3 h-3 mr-1" />
            {t('comptoir.rejected')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredRequests = aidRequests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const handleApprove = () => {
    if (!selectedRequest) return;

    if (!appointmentDate || !appointmentTime) {
      toast.error(t('common.error'), {
        description: 'La date et l\'heure du rendez-vous sont requises'
      });
      return;
    }

    setAidRequests(prev => prev.map(req => 
      req.id === selectedRequest.id 
        ? {
            ...req,
            status: 'approved' as const,
            processedDate: new Date().toLocaleString('fr-CA'),
            processedBy: 'Admin Système',
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime
          }
        : req
    ));

    toast.success(
      <div>
        <div className="font-semibold">{t('comptoir.requestApproved')}</div>
        <div className="text-sm text-[#666666] mt-1">
          {selectedRequest.beneficiaire} - {selectedRequest.type}
        </div>
        <div className="text-xs text-[#666666] mt-1">
          RDV: {appointmentDate} à {appointmentTime}
        </div>
      </div>,
      { duration: 5000 }
    );

    setShowApproveDialog(false);
    setSelectedRequest(null);
    setAppointmentDate('');
    setAppointmentTime('');
  };

  const handleReject = () => {
    if (!selectedRequest) return;

    setAidRequests(prev => prev.map(req => 
      req.id === selectedRequest.id 
        ? {
            ...req,
            status: 'rejected' as const,
            processedDate: new Date().toLocaleString('fr-CA'),
            processedBy: 'Admin Système',
            rejectionReason: rejectionReason || 'Non spécifié'
          }
        : req
    ));

    toast.error(
      <div>
        <div className="font-semibold">{t('comptoir.requestRejected')}</div>
        <div className="text-sm text-[#666666] mt-1">
          {selectedRequest.beneficiaire} - {selectedRequest.type}
        </div>
      </div>,
      { duration: 5000 }
    );

    setShowRejectDialog(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const getStatusCount = (status: string) => {
    return aidRequests.filter(req => req.status === status).length;
  };

  return (
    <div className="space-y-6">
      <BoutonRetourHeader 
        onClick={() => onNavigate('dashboard')} 
        titre="Demandes d'Aide"
      />
      {/* Header with stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#FFC107] to-[#FFB300] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('comptoir.pendingRequests')}</p>
                <p className="text-3xl font-bold mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {getStatusCount('pending')}
                </p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('comptoir.approvedRequests')}</p>
                <p className="text-3xl font-bold mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {getStatusCount('approved')}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#DC3545] to-[#C82333] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('comptoir.rejectedRequests')}</p>
                <p className="text-3xl font-bold mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {getStatusCount('rejected')}
                </p>
              </div>
              <XCircle className="w-12 h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1E73BE] to-[#1557A0] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('comptoir.allRequests')}</p>
                <p className="text-3xl font-bold mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {aidRequests.length}
                </p>
              </div>
              <Package className="w-12 h-12 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and list */}
      <Card>
        <CardHeader className="border-b bg-[#F4F4F4]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Package className="w-5 h-5" />
              {t('comptoir.aidRequests')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#666666]" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('comptoir.allStatuses')}</SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#FFC107]" />
                      {t('comptoir.pending')}
                    </div>
                  </SelectItem>
                  <SelectItem value="approved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                      {t('comptoir.approved')}
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-[#DC3545]" />
                      {t('comptoir.rejected')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRequests.length > 0 ? (
            <div className="divide-y">
              {filteredRequests.map((request) => (
                <div 
                  key={request.id}
                  className="p-4 hover:bg-[#F4F4F4] transition-colors"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left side - Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-[#1E73BE]" />
                        </div>
                        <div>
                          <div 
                            className="font-semibold text-[#333333] cursor-pointer hover:text-[#1E73BE]"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                            onClick={() => onNavigate('fiche-beneficiaire', request.beneficiaireId)}
                          >
                            {request.beneficiaire}
                          </div>
                          <div className="text-sm text-[#666666]">
                            {request.type} • Qté: {request.quantite}
                            {request.estimatedValue && (
                              <span className="ml-2">• {request.estimatedValue.toFixed(2)} CAD$</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {request.notes && (
                        <div className="bg-[#FFF9E6] border-l-4 border-[#FFC107] p-2 rounded text-sm">
                          <AlertCircle className="w-4 h-4 inline mr-1 text-[#FFC107]" />
                          <span className="text-[#666666]">{request.notes}</span>
                        </div>
                      )}

                      {request.rejectionReason && (
                        <div className="bg-[#FFE6E6] border-l-4 border-[#DC3545] p-2 rounded text-sm">
                          <XCircle className="w-4 h-4 inline mr-1 text-[#DC3545]" />
                          <span className="text-[#666666]">
                            <strong>{t('comptoir.rejectionReason')}:</strong> {request.rejectionReason}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-[#999999]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {request.dateRequested}
                        </div>
                        {request.processedDate && (
                          <>
                            <span>•</span>
                            <div>
                              {t('comptoir.processedDate')}: {request.processedDate}
                            </div>
                          </>
                        )}
                        {request.processedBy && (
                          <>
                            <span>•</span>
                            <div>
                              {t('comptoir.processedBy')}: {request.processedBy}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right side - Status and actions */}
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                      {getStatusBadge(request.status)}
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-[#4CAF50] hover:bg-[#45a049]"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApproveDialog(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('comptoir.approveRequest')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {t('comptoir.rejectRequest')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#666666]">
              <Package className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" />
              <p className="text-lg font-medium">{t('comptoir.noRequestsYet')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent aria-describedby="approve-dialog-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#4CAF50]">
              <CheckCircle className="w-6 h-6" />
              {t('comptoir.approveRequest')}
            </DialogTitle>
            <DialogDescription id="approve-dialog-description">
              Approuver cette demande d'aide alimentaire
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-3 py-4">
              <div className="bg-[#F4F4F4] p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm text-[#666666]">{t('comptoir.beneficiaryName')}:</span>
                  <p className="font-semibold">{selectedRequest.beneficiaire}</p>
                </div>
                <div>
                  <span className="text-sm text-[#666666]">{t('comptoir.aidType')}:</span>
                  <p className="font-semibold">{selectedRequest.type}</p>
                </div>
                <div>
                  <span className="text-sm text-[#666666]">{t('comptoir.quantity')}:</span>
                  <p className="font-semibold">{selectedRequest.quantite}</p>
                </div>
                {selectedRequest.estimatedValue && (
                  <div>
                    <span className="text-sm text-[#666666]">{t('comptoir.estimatedValue')}:</span>
                    <p className="font-semibold">{selectedRequest.estimatedValue.toFixed(2)} CAD$</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('comptoir.appointmentDate')}</Label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('comptoir.appointmentTime')}</Label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              onClick={handleApprove}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('comptoir.approveRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent aria-describedby="reject-dialog-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#DC3545]">
              <XCircle className="w-6 h-6" />
              {t('comptoir.rejectRequest')}
            </DialogTitle>
            <DialogDescription id="reject-dialog-description">
              {t('comptoir.rejectConfirm')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="bg-[#F4F4F4] p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm text-[#666666]">{t('comptoir.beneficiaryName')}:</span>
                  <p className="font-semibold">{selectedRequest.beneficiaire}</p>
                </div>
                <div>
                  <span className="text-sm text-[#666666]">{t('comptoir.aidType')}:</span>
                  <p className="font-semibold">{selectedRequest.type}</p>
                </div>
              </div>

              <div>
                <Label>{t('comptoir.rejectionReason')} ({t('comptoir.optional')})</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi cette demande est refusée..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-[#DC3545] hover:bg-[#C82333]"
              onClick={handleReject}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {t('comptoir.rejectRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}