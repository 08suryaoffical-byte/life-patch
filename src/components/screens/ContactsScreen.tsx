import React, { useState } from 'react';
import { EmergencyContact, DeviceLocation } from '../../types';
import { triggerSms, generateDistressMessage } from '../../utils/emergencyDialer';
import { TelephonyArchitectureModal } from '../TelephonyArchitectureModal';

interface ContactsScreenProps {
  contacts: EmergencyContact[];
  onUpdateContacts: (contacts: EmergencyContact[]) => void;
  onAddContact?: (contact: EmergencyContact) => Promise<void>;
  onEditContact?: (contact: EmergencyContact) => Promise<void>;
  onDeleteContact?: (id: string) => Promise<void>;
  onEmergencyDial: (number: string, contactName?: string, relation?: string) => void;
  onBackToHome?: () => void;
  isDemoMode?: boolean;
  isSafeTestMode?: boolean;
  onToggleSafeTestMode?: () => void;
  location?: DeviceLocation | null;
  userName?: string;
  onSosCallContact?: (contact: EmergencyContact) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  contacts,
  onUpdateContacts,
  onAddContact,
  onEditContact,
  onDeleteContact,
  onEmergencyDial,
  onBackToHome,
  isDemoMode = false,
  isSafeTestMode = false,
  onToggleSafeTestMode,
  location,
  userName = 'Yokitha',
  onSosCallContact,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPriority, setNewPriority] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [showArchModal, setShowArchModal] = useState(false);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    setIsSubmitting(true);
    try {
      if (onEditContact) {
        await onEditContact(editingContact);
      } else {
        onUpdateContacts(
          contacts.map((c) => (c.id === editingContact.id ? editingContact : c))
        );
      }
      showToast(`Guardian ${editingContact.name} updated successfully.`);
      setEditingContact(null);
    } catch (err) {
      console.error('Failed to update contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    setIsSubmitting(true);
    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: newName,
      relation: newRelation || 'Family Member',
      phone: newPhone.startsWith('+91') ? newPhone : `+91 ${newPhone}`,
      priority: newPriority || contacts.length + 1,
      status: 'pending',
    };

    try {
      if (onAddContact) {
        await onAddContact(newContact);
      } else {
        onUpdateContacts([...contacts, newContact]);
      }
      showToast(`Added ${newContact.name} to Family Emergency Circle.`);
      setNewName('');
      setNewRelation('');
      setNewPhone('');
      setNewPriority(contacts.length + 2);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      if (onDeleteContact) {
        await onDeleteContact(id);
      } else {
        onUpdateContacts(contacts.filter((c) => c.id !== id));
      }
      showToast(`Removed ${name} from Emergency Circle.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageContact = (contact: EmergencyContact) => {
    const msg = generateDistressMessage(
      userName,
      location || null,
      `Direct dispatch to ${contact.name} (${contact.relation}).`
    );
    triggerSms(contact.phone, msg, { isSafeTestMode });
    showToast(
      isSafeTestMode
        ? `[Safe Test] SMS prefill simulated for ${contact.name}.`
        : `SMS app launched with distress GPS link for ${contact.name}.`
    );
  };

  const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority);

  return (
    <div className="flex flex-col w-full pt-3 pb-24 px-4 gap-3">
      {/* Sleek Top Navigation Bar for Contacts Screen */}
      <div className="flex items-center justify-between py-1 border-b border-surface-container">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary active:scale-95 transition-all cursor-pointer py-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Home</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-primary">Family Guardians</span>
        )}

        <div className="flex items-center gap-2">
          {onToggleSafeTestMode && (
            <button
              onClick={onToggleSafeTestMode}
              className={`h-7 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                isSafeTestMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-surface-container text-on-surface-variant border-surface-container-high hover:bg-surface-container-high'
              }`}
              type="button"
              title="Toggle Safe Test Mode to test without placing real phone calls"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isSafeTestMode ? 'science' : 'science_off'}
              </span>
              <span>{isSafeTestMode ? 'Test Mode: ON' : 'Test Mode: OFF'}</span>
            </button>
          )}

          <button
            onClick={() => onEmergencyDial('1091', 'SSF Women Helpline', 'Emergency Hotline')}
            className="h-7 px-2.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold flex items-center gap-1 shadow-xs hover:opacity-90 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">call</span>
            <span>SSF 1091</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">family_restroom</span>
            <h1 className="text-base font-bold text-primary">Family Emergency Circle</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[11px] font-bold">
              {contacts.length} Guardians
            </span>
            {isDemoMode ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                Demo (In-Memory)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                Cloud Synced
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Authorized family members and trusted guardians receive automatic priority escalation, live GPS coordinates, and secure location map links during emergency alerts.
        </p>

        {/* Safe Test Mode Banner */}
        {isSafeTestMode ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-xs text-amber-900">
            <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">
              science
            </span>
            <div className="flex-1">
              <span className="font-bold block">Safe Test Mode Active:</span>
              <span>
                Real telephone calls and carrier dialing are suppressed. You can safely test contact escalation, cancellation windows, and guardian notifications without placing real phone calls.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-start justify-between gap-2 text-xs text-blue-900">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                phone_in_talk
              </span>
              <div>
                <span className="font-bold block">Direct Calling Integration (Web App)</span>
                <span className="text-[11px] text-blue-800">
                  Tapping Call opens your device's native phone dialer with the number prefilled. Press Call in your phone app to complete.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowArchModal(true)}
              className="text-[10px] font-bold underline text-secondary hover:text-secondary-container shrink-0 cursor-pointer pt-0.5"
              type="button"
            >
              Learn More
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 h-10 rounded-lg bg-secondary text-on-secondary text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:bg-secondary-container transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add Family Guardian</span>
          </button>
          <button
            onClick={() => setShowArchModal(true)}
            className="h-10 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Calling Specs</span>
          </button>
        </div>
      </div>

      {/* Floating Feedback Toast */}
      {feedbackToast && (
        <div className="bg-primary text-on-primary text-xs font-semibold px-3 py-2 rounded-xl shadow-lg border border-primary-container flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span className="flex-1">{feedbackToast}</span>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-3">
        {sortedContacts.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-xs border border-dashed border-surface-container-high flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">person_off</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">No Family Guardians Configured</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mt-1">
                Add trusted family members who should receive automatic distress SMS, live GPS coordinates, and direct emergency calls.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-1 px-4 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-secondary-container transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Add First Guardian</span>
            </button>
          </div>
        ) : (
          sortedContacts.map((contact, index) => (
            <div
              key={contact.id}
              className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5"
            >
              {/* Top Contact Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-sm font-black shrink-0 shadow-xs">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-mono font-bold flex items-center justify-center border border-white">
                      #{contact.priority || index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-on-surface">{contact.name}</h3>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold">
                        {contact.relation}
                      </span>
                    </div>
                    <p className="text-xs font-mono font-medium text-on-surface-variant mt-0.5">
                      {contact.phone}
                    </p>
                  </div>
                </div>

                {/* Edit & Delete Mini Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                    title="Edit guardian"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id, contact.name)}
                    className="w-8 h-8 rounded-lg bg-surface-container hover:bg-error-container text-on-surface-variant hover:text-error flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                    title="Remove guardian"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>

              {/* 3 Explicit Calling & Messaging Actions (Call, SOS Call, Message) */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-surface-container/60">
                {/* 1. Direct Phone Call */}
                <button
                  onClick={() => onEmergencyDial(contact.phone, contact.name, contact.relation)}
                  className="h-9 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  type="button"
                  title="Direct phone call via device dialer"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">call</span>
                  <span>Call</span>
                </button>

                {/* 2. Priority SOS Escalation Call */}
                <button
                  onClick={() => {
                    if (onSosCallContact) {
                      onSosCallContact(contact);
                    } else {
                      onEmergencyDial(contact.phone, contact.name, contact.relation);
                    }
                  }}
                  className="h-9 px-2 rounded-lg bg-error hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                  type="button"
                  title="Emergency SOS call with GPS broadcast"
                >
                  <span className="material-symbols-outlined text-[16px]">emergency_share</span>
                  <span>SOS Call</span>
                </button>

                {/* 3. Send SMS with Live GPS Link */}
                <button
                  onClick={() => handleMessageContact(contact)}
                  className="h-9 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  type="button"
                  title="Send distress SMS with live coordinates"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">sms</span>
                  <span>Message</span>
                </button>
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    check_circle
                  </span>
                  <span>
                    Priority #{contact.priority || index + 1} • Authorized Emergency Receiver
                  </span>
                </span>
                <span className="font-bold text-secondary text-[10px]">Ready</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emergency Services Quick Shortcuts */}
      <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-surface-container flex flex-col gap-2">
        <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
          Official Emergency Services (India)
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onEmergencyDial('112', 'Tamil Nadu Police 112', 'Control Room')}
            className="p-2.5 rounded-xl bg-error-container/40 border border-error/30 hover:bg-error-container/60 text-on-error-container flex items-center gap-2 text-left cursor-pointer transition-colors"
            type="button"
          >
            <div className="w-8 h-8 rounded-lg bg-error text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">local_police</span>
            </div>
            <div>
              <span className="text-xs font-bold block text-error">Police 112</span>
              <span className="text-[10px] text-on-surface-variant block">National 24/7 ERSS</span>
            </div>
          </button>

          <button
            onClick={() => onEmergencyDial('1091', 'Singappen Special Force', 'Women Helpline')}
            className="p-2.5 rounded-xl bg-pink-100/60 border border-pink-300 hover:bg-pink-100 text-pink-900 flex items-center gap-2 text-left cursor-pointer transition-colors"
            type="button"
          >
            <div className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div>
              <span className="text-xs font-bold block text-pink-700">SSF 1091</span>
              <span className="text-[10px] text-on-surface-variant block">TN Women Helpline</span>
            </div>
          </button>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full p-5 rounded-2xl shadow-xl flex flex-col gap-3 border border-surface-container">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-primary">Add Family Guardian</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddContact} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amma, Appa, Senthil"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Relationship to You
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mother, Father, Sister, Guardian"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 94431 23091"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Escalation Priority Order (1 = First to Call)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newPriority}
                  onChange={(e) => setNewPriority(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-lg bg-surface-container text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-lg bg-secondary text-on-secondary text-xs font-bold shadow-xs hover:bg-secondary-container cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Guardian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full p-5 rounded-2xl shadow-xl flex flex-col gap-3 border border-surface-container">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-primary">Edit Family Guardian</h3>
              <button
                onClick={() => setEditingContact(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingContact.name}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, name: e.target.value })
                  }
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Relation</label>
                <input
                  type="text"
                  value={editingContact.relation}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, relation: e.target.value })
                  }
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={editingContact.phone}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, phone: e.target.value })
                  }
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Priority Order</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingContact.priority}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      priority: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-surface-container"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="flex-1 h-10 rounded-lg bg-surface-container text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-lg bg-secondary text-on-secondary text-xs font-bold shadow-xs hover:bg-secondary-container cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Guardian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telephony Architecture Modal */}
      <TelephonyArchitectureModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />
    </div>
  );
};
