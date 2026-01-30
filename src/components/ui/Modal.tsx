import { Dialog, Transition } from '@headlessui/react';
import { clx } from '@/lib/actions/utils';
import React, { Fragment } from 'react';
import { X } from 'lucide-react';

import { ModalProvider, useModal } from '@/lib/context/modal-context';

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  size?: 'small' | 'medium' | 'large';
  search?: boolean;
  noBackdrop?: boolean;
  position?: 'center' | 'bottom';
  children: React.ReactNode;
  'data-testid'?: string;
};

const Modal = ({
  isOpen,
  close,
  size = 'medium',
  search = false,
  noBackdrop = false,
  position = 'center',
  children,
  'data-testid': dataTestId,
}: ModalProps) => {
  if (!isOpen) return null;

  const isBottom = position === 'bottom';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={noBackdrop ? 'relative z-50' : 'relative z-75'}
        onClose={close}
      >
        {!noBackdrop && (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={clx(
                'fixed inset-0 h-screen',
                isBottom ? 'bg-black/8' : 'bg-black/25'
              )}
            />
          </Transition.Child>
        )}

        {isBottom ? (
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full h-full justify-center items-end p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-full"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-full"
              >
                <Dialog.Panel
                  data-testid={dataTestId}
                  className={clx(
                    'flex flex-col justify-start w-full transform text-left align-middle transition-all bg-white shadow-xl rounded-t-xl border-t',
                    {
                      'max-w-md': size === 'small',
                      'max-w-xl': size === 'medium',
                      'max-w-3xl': size === 'large',
                    }
                  )}
                >
                  <ModalProvider close={close}>{children}</ModalProvider>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        ) : noBackdrop ? (
          <div className="relative">
            <Dialog.Panel
              data-testid={dataTestId}
              className={clx(
                'flex flex-col justify-start w-full transform p-5 text-left align-middle transition-all',
                {
                  'max-w-md': size === 'small',
                  'max-w-xl': size === 'medium',
                  'max-w-3xl': size === 'large',
                  'bg-transparent shadow-none': search,
                  'bg-white shadow-xl border rounded-lg': !search,
                }
              )}
            >
              <ModalProvider close={close}>{children}</ModalProvider>
            </Dialog.Panel>
          </div>
        ) : (
          <div className="fixed inset-0 overflow-y-auto">
            <div
              className={clx(
                'flex min-h-full h-full justify-center p-4 text-center',
                {
                  'items-center': !search,
                  'items-start': search,
                }
              )}
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  data-testid={dataTestId}
                  className={clx(
                    'flex flex-col justify-start w-full transform p-5 text-left align-middle transition-all max-h-[75vh] h-fit',
                    {
                      'max-w-md': size === 'small',
                      'max-w-xl': size === 'medium',
                      'max-w-3xl': size === 'large',
                      'bg-transparent shadow-none': search,
                      'bg-white shadow-xl border rounded-lg': !search,
                    }
                  )}
                >
                  <ModalProvider close={close}>{children}</ModalProvider>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        )}
      </Dialog>
    </Transition>
  );
};

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { close } = useModal();

  return (
    <Dialog.Title className="flex items-center justify-between">
      <div className="text-lg font-semibold">{children}</div>
      <div>
        <button
          onClick={close}
          data-testid="close-modal-button"
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </div>
    </Dialog.Title>
  );
};

const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Dialog.Description className="flex text-sm text-gray-600 items-center justify-center pt-2 pb-4 h-full">
      {children}
    </Dialog.Description>
  );
};

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex justify-center">{children}</div>;
};

const Footer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-center justify-end gap-x-4">{children}</div>
  );
};

Modal.Title = Title;
Modal.Description = Description;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
