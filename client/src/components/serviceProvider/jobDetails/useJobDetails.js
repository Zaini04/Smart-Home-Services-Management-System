// jobDetails/useJobDetails.js
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { getApiBaseUrl } from "../../../utils/url";
import {
  getJobDetails, verifyStartOTP, completeInspection, sendFinalPrice, startWork,
  completeWork, requestInspection, updatePriceDuringWork, updateSchedule,
  providerCancelJob, getProviderWallet, respondToCounterFee, updatePendingSchedule
} from "../../../api/serviceProviderEndPoints";

export function useJobDetails(bookingId, user) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const apiBaseUrl = getApiBaseUrl();

  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [conflictModal, setConflictModal] = useState(null);

  const { data: booking, isLoading: loading } = useQuery({
    queryKey: ["providerJob", bookingId],
    queryFn: async () => { const res = await getJobDetails(bookingId); return res.data.data; },
    enabled: !!user && !!bookingId,
  });

  const { data: walletBalance = 0 } = useQuery({
    queryKey: ["providerWallet"],
    queryFn: async () => {
      const res = await getProviderWallet();
      const w = res.data.data;
      return w.availableBalance ?? w.balance - (w.lockedAmount || 0);
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    const socket = io(apiBaseUrl, { auth: { token }, withCredentials: true, transports: ["websocket", "polling"] });
    socket.on("data_updated", () => {
      queryClient.invalidateQueries(["providerJob", bookingId]);
      queryClient.invalidateQueries(["providerWallet"]);
    });
    return () => socket.disconnect();
  }, [queryClient, bookingId, user, apiBaseUrl]);

  const showAlert = (type, text) => { setAlertMsg({ type, text }); setTimeout(() => setAlertMsg(null), 5000); };
  const refreshLocal = () => { queryClient.invalidateQueries(["providerJob", bookingId]); queryClient.invalidateQueries(["providerWallet"]); };

  const handleAction = async (actionFn, successMsg) => {
    try {
      setActionLoading(true);
      await actionFn();
      if (successMsg) showAlert("success", successMsg);
      refreshLocal();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const methods = {
    handleVerifyOTP: (otp) => handleAction(() => verifyStartOTP(bookingId, { otp }), "Start OTP verified!"),
    handleCompleteInspection: (data) => handleAction(() => completeInspection(bookingId, data), "Price sent to resident!"),
    handleSendPrice: (data) => handleAction(() => sendFinalPrice(bookingId, data), "Price sent to resident!"),
    handleUpdatePendingSchedule: (data) => handleAction(() => updatePendingSchedule(bookingId, data), "Schedule updated! Resident must re-approve."),
    handleStartWork: () => handleAction(() => startWork(bookingId), "Work started!"),
    handleCompleteWork: () => handleAction(() => completeWork(bookingId), "Work marked complete! Ask resident to confirm with OTP."),
    handleRequestInspection: (data) => handleAction(() => requestInspection(bookingId, data), "Inspection requested! Waiting for resident approval."),
    handleUpdatePrice: (data) => handleAction(() => updatePriceDuringWork(bookingId, data), "Price revision sent to resident for approval."),
    handleCancelJob: async (reason, onDone) => {
      await handleAction(() => providerCancelJob(bookingId, { reason }), "Job cancelled.");
      if (onDone) onDone();
    },
    handleRespondToCounter: (action, fee) => handleAction(() => respondToCounterFee(bookingId, { action, fee }), action === "accept" ? "Counter offer accepted!" : "New fee proposed!"),
    handleUpdateSchedule: async (data) => {
      try {
        setActionLoading(true);
        await updateSchedule(bookingId, data);
        setConflictModal(null);
        showAlert("success", "Schedule updated! Resident will review.");
        refreshLocal();
      } catch (err) {
        const apiError = err.response?.data;
        const conflict = apiError?.extra?.conflict || apiError?.conflict;
        if (conflict) setConflictModal(conflict);
        else showAlert("error", apiError?.message || "Failed to update schedule");
      } finally {
        setActionLoading(false);
      }
    }
  };

  return { loading, actionLoading, booking, walletBalance, alertMsg, conflictModal, setConflictModal, ...methods };
}

