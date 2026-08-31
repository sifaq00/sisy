"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, X } from "lucide-react";

export interface AuditItem {
  id: string;
  time: string;
  message: string;
  color: string;
}

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditItem[];
}

export default function AuditLogModal({
  isOpen,
  onClose,
  auditLogs,
}: AuditLogModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 bg-[#211F1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#E2D9C6] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#211F1A] flex items-center gap-2">
                <History className="w-4 h-4 text-[#C9662A]" />
                Workspace Audit Log
              </h3>
              <button
                onClick={onClose}
                className="text-[#8C867A] hover:text-[#211F1A] p-1.5 rounded-lg hover:bg-[#E9E1CF] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-xs font-mono bg-[#EFE8D8]/50 p-2.5 rounded-xl border border-[#E2D9C6]/60"
                >
                  <span style={{ color: log.color }} className="font-medium">
                    {log.message}
                  </span>
                  <span className="text-[10px] text-[#8C867A]">{log.time}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E2D9C6] flex justify-between items-center text-[10px] font-mono text-[#8C867A]">
              <span>{auditLogs.length} events recorded</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-[#211F1A] text-white text-xs font-sans hover:bg-[#C9662A] transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
