'use client';

import { SignedOut, SignInButton, SignedIn, UserButton } from '@clerk/nextjs';
import { RoomProvider, ClientSideSuspense } from '@liveblocks/react/suspense'
import React, { useEffect, useRef, useState } from 'react'
import { Editor } from './editor/Editor';
import Header from './Header';
import ActiveCollaborators from './ActiveCollaborators';
import { Input } from './ui/input';
import Image from 'next/image';
import { updateDocument } from '@/lib/actions/room.actions';
import Loader from './Loader';
import ShareModal from './ShareModal';

export const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) => {
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const [editing, setIsEditing] = useState(false);
  const [loading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsLoading(true);
      
      try {
        if (documentTitle !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, documentTitle);
          
          if (updatedDocument) {
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
      
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsEditing(false);
        updateDocument(roomId, documentTitle);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [roomId, documentTitle]);
  
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing])
  
  return (
    <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<Loader />}>
          <div className="collaborative-room">
            <Header>
                <div ref={containerRef} className="flex w-fit items-center justify-center gap-2">
                    {editing && !loading ? (
                      <Input 
                        type="text"
                        value={documentTitle}
                        ref={inputRef}
                        placeholder="Enter Title"
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        onKeyDown={updateTitleHandler}
                        disable={!editing}
                        className="document-title-input"
                      />
                    ): (
                      <>
                        <p className="document-title">{documentTitle}</p>
                      </>
                    )}
                    
                    {currentUserType === 'editor' && !editing && (
                      <Image 
                        src="/assets/icons/edit.svg"
                        alt="edit"
                        width={24}
                        height={24}
                        onClick={() => setIsEditing(true)}
                        className="pointer"
                      />
                    )}
                    
                    {currentUserType !== 'editor' && !editing && (
                      <p className="view-only-tag">View Only</p>
                    )}
                    
                    {loading && <p className="text-sm text-gray-400">Saving...</p>}
                </div>
                <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
                  <ActiveCollaborators />
                  
                  <ShareModal 
                    roomId={roomId}
                    collaborators={users}
                    creatorId={roomMetadata.creatorId}
                    currentUserType={currentUserType} />
                  
                  <SignedOut>
                    <SignInButton />
                  </SignedOut>
                  <SignedIn>
                      <UserButton />
                  </SignedIn>
                </div>
            </Header>
            <Editor roomId={roomId} currentUserType={currentUserType} />
          </div>
        </ClientSideSuspense>
    </RoomProvider>
  )
}
