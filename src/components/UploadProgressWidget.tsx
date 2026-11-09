import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Gauge,
} from 'lucide-react';
import { UploadProgressItem } from '../types/drive';
import { formatBytes, formatSeconds } from '../utils/driveLogic';

interface UploadProgressWidgetProps {
  uploads?: UploadProgressItem[];
  tasks?: UploadProgressItem[];
  onDismiss: () => void;
  onCancelTask?: (id: string) => void;
}

export const UploadProgressWidget: React.FC<UploadProgressWidgetProps> = ({
  uploads,
  tasks,
  onDismiss,
  onCancelTask,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const taskList = uploads || tasks || [];

  if (taskList.length === 0) return null;

  const activeCount = taskList.filter((t) => t.status === 'uploading').length;
  const completedCount = taskList.filter((t) => t.status === 'completed').length;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-gray-900 transition-all duration-200 animate-in slide-in-from-bottom-5">
      {/* Header bar */}
      <div className="px-4 py-3 bg-gray-900 text-white flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <UploadCloud className={`w-4 h-4 text-blue-400 ${activeCount > 0 ? 'animate-bounce' : ''}`} />
          <span className="text-xs font-bold">
            {activeCount > 0
              ? `Uploading ${activeCount} item${activeCount > 1 ? 's' : ''}...`
              : `${completedCount} upload${completedCount > 1 ? 's' : ''} complete`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-gray-800 text-gray-300 transition cursor-pointer"
            aria-label={isMinimized ? 'Expand upload window' : 'Minimize upload window'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-gray-800 text-gray-300 transition cursor-pointer"
            aria-label="Close upload status"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: Task list */}
      {!isMinimized && (
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 p-2 text-xs">
          {taskList.map((task) => {
            const isDone = task.status === 'completed';
            const isErr = task.status === 'error';

            return (
              <div key={task.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-800 truncate flex-1" title={task.fileName}>
                    {task.fileName}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </span>
                  ) : isErr ? (
                    <span className="flex items-center gap-1 text-red-600 font-bold text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Failed</span>
                    </span>
                  ) : (
                    <span className="text-blue-600 font-black text-xs font-mono">
                      {task.percentage}%
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 rounded-full ${
                      isDone ? 'bg-emerald-500' : isErr ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, task.percentage))}%` }}
                  />
                </div>

                {/* Live Speed, Bytes, and Elapsed/Remaining Time Info */}
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>
                      {formatBytes(task.loadedBytes)} / {formatBytes(task.sizeBytes)}
                    </span>
                    {!isDone && !isErr && task.speedBytesPerSec > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-blue-600 font-semibold">
                          <Gauge className="w-3 h-3" />
                          {formatBytes(task.speedBytesPerSec)}/s
                        </span>
                      </>
                    )}
                  </div>

                  {!isDone && !isErr && (
                    <div className="flex items-center gap-1 text-gray-600 font-medium">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>
                        {task.remainingSeconds > 0
                          ? `${formatSeconds(task.remainingSeconds)} left`
                          : `${formatSeconds(task.elapsedSeconds)} elapsed`}
                      </span>
                    </div>
                  )}
                </div>

                {task.errorMessage && (
                  <p className="text-[10px] text-red-600 font-medium">{task.errorMessage}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
