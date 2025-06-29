'use client';
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Card from "@/component/ui/Card";
import Header from "@/component/ui/Header";
import Button from "@/component/ui/Button";
import { useFlashcardActions } from "@/hook/useFlashcardActions";
import { Flashcard, FlashcardSet } from "@/lib/database.types";
import { createClient } from "@/utils/supabase/client";
import { Share01Icon } from "hugeicons-react";
import { formatMultipleChoiceQuestion } from "@/lib/utils";

const supabase = createClient();

export default function FlashcardPage() {
    const params = useParams();
    const router = useRouter();
    const flashcardId = params.flashcardId as string;
    
    const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
    const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState({ total: 0, mastered: 0, percentage: 0 });
    const [isMarkingMastered, setIsMarkingMastered] = useState(false);
    const [isLastCard, setIsLastCard] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [allCards, setAllCards] = useState<{ id: string }[]>([]);
    const [isSharing, setIsSharing] = useState(false);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);

    const { 
        getFlashcardById, 
        getFlashcardSetById, 
        markFlashcardAsMastered, 
        getSetProgress,
        getNextCard,
        getPreviousCard,
        togglePublicStatus
    } = useFlashcardActions();

    const loadFlashcard = useCallback(async () => {
        if (!flashcardId) return;
        
        setIsLoading(true);
        try {
            const flashcardData = await getFlashcardById(flashcardId);
            if (flashcardData) {
                setFlashcard(flashcardData);
                
                // Get all cards to determine current index
                const { data: allCardsData } = await supabase
                    .from('flashcards')
                    .select('id')
                    .eq('set_id', flashcardData.set_id)
                    .order('order', { ascending: true });
                
                if (allCardsData) {
                    setAllCards(allCardsData);
                    const index = allCardsData.findIndex((card: { id: string }) => card.id === flashcardId);
                    setCurrentCardIndex(index); // 0-based index
                }
                
                // Load flashcard set details
                const setData = await getFlashcardSetById(flashcardData.set_id);
                if (setData) {
                    setFlashcardSet(setData);
                    
                    // Load progress
                    const progressData = await getSetProgress(flashcardData.set_id);
                    setProgress(progressData);
                }
            }
        } catch (error) {
            console.error('Error loading flashcard:', error);
        } finally {
            setIsLoading(false);
        }
    }, [flashcardId, getFlashcardById, getFlashcardSetById, getSetProgress]);

    useEffect(() => {
        loadFlashcard();
    }, [loadFlashcard]);

    const handleShowAnswer = useCallback(() => {
        setShowAnswer(true);
    }, []);

    const handleHideAnswer = useCallback(() => {
        setShowAnswer(false);
    }, []);

    const handleMarkAsMastered = useCallback(async () => {
        if (!flashcard) return;
        
        setIsMarkingMastered(true);
        try {
            await markFlashcardAsMastered(flashcard.id);
            
            // Update local state
            setFlashcard(prev => prev ? { ...prev, status: 'mastered' } : null);
            
            // Refresh progress
            const progressData = await getSetProgress(flashcard.set_id);
            setProgress(progressData);
            
            // Show success feedback
            setTimeout(() => {
                setShowAnswer(false);
            }, 1500);
        } catch (error) {
            console.error('Error marking as mastered:', error);
        } finally {
            setIsMarkingMastered(false);
        }
    }, [flashcard, markFlashcardAsMastered, getSetProgress]);

    const handleNextCard = useCallback(() => {
        if (!allCards.length || currentCardIndex === -1) return;
        if (currentCardIndex < allCards.length - 1) {
            const nextCardId = allCards[currentCardIndex + 1].id;
            router.push(`/flashcards/${nextCardId}`);
        } else {
            setIsLastCard(true);
            setShowAnswer(false);
        }
    }, [allCards, currentCardIndex, router]);

    const handlePreviousCard = useCallback(() => {
        if (!allCards.length || currentCardIndex === -1) return;
        if (currentCardIndex > 0) {
            const prevCardId = allCards[currentCardIndex - 1].id;
            router.push(`/flashcards/${prevCardId}`);
        }
    }, [allCards, currentCardIndex, router]);

    const handleToggleSharing = useCallback(async () => {
        if (!flashcardSet) return;
        
        setIsSharing(true);
        try {
            const newPublicStatus = !flashcardSet.is_public;
            await togglePublicStatus(flashcardSet.id, newPublicStatus);
            
            // Update local state
            setFlashcardSet(prev => prev ? { ...prev, is_public: newPublicStatus } : null);
        } catch (error) {
            console.error('Error toggling sharing:', error);
        } finally {
            setIsSharing(false);
        }
    }, [flashcardSet, togglePublicStatus]);

    const handleCopyShareLink = useCallback(async () => {
        if (!flashcardSet?.is_public) {
            // First make it public
            await handleToggleSharing();
        }
        
        const shareUrl = `${window.location.origin}/public/flashcards/${flashcardSet?.id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setShareLinkCopied(true);
            setTimeout(() => setShareLinkCopied(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    }, [flashcardSet, handleToggleSharing]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-background-muted rounded mb-6"></div>
                        <div className="h-64 bg-background-muted rounded mb-4"></div>
                        <div className="h-12 bg-background-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!flashcard) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <Header title="Flashcard Not Found" />
                    <Card>
                        <Card.Header>
                            <p className="text-foreground-muted">The flashcard you're looking for doesn't exist.</p>
                        </Card.Header>
                    </Card>
                </div>
            </div>
        );
    }

    const isMastered = flashcard.status === 'mastered';

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header with progress */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Header title={flashcardSet?.title || "Flashcard"} />
                        {flashcardSet && (
                            <div className="flex items-center gap-2">
                                {flashcardSet.is_public && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Public
                                    </span>
                                )}
                                <Button
                                    onClick={handleCopyShareLink}
                                    variant="outline"
                                    size="sm"
                                    disabled={isSharing}
                                    className="flex items-center gap-2"
                                >
                                    <Share01Icon className="w-4 h-4" />
                                    {shareLinkCopied ? (
                                        <>
                                            <span>✓</span>
                                            Copied!
                                        </>
                                    ) : (
                                        'Share'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-foreground-muted">
                                Progress: {progress.mastered}/{progress.total} cards mastered
                            </span>
                            <span className="text-sm font-medium text-foreground">
                                {progress.percentage}%
                            </span>
                        </div>
                        <div className="w-full bg-background-muted rounded-full h-2">
                            <div 
                                className="bg-accent h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Flashcard */}
                <Card className="mb-6">
                    <Card.Header className="pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold text-foreground">Question</h2>
                            {isMastered && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    Mastered
                                </span>
                            )}
                        </div>
                        <div className="text-lg text-foreground leading-relaxed whitespace-pre-line">
                            {formatMultipleChoiceQuestion(flashcard.question)}
                        </div>
                    </Card.Header>

                    {showAnswer && (
                        <div className="border-t border-border pt-4">
                            <h3 className="text-lg font-semibold text-foreground mb-3">Answer</h3>
                            <div className="text-lg text-foreground leading-relaxed mb-6">
                                {flashcard.answer}
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex gap-3">
                                {!isMastered && (
                                    <Button 
                                        onClick={handleMarkAsMastered}
                                        disabled={isMarkingMastered}
                                        className="flex-1"
                                    >
                                        {isMarkingMastered ? "Marking..." : "Mark as Mastered"}
                                    </Button>
                                )}
                                <Button 
                                    variant="outline" 
                                    onClick={handleNextCard}
                                    className="flex-1"
                                >
                                    {isLastCard ? "Last Card" : "Next Card"}
                                </Button>
                            </div>
                            {isLastCard && (
                                <p className="text-sm text-foreground-muted mt-4 text-center">
                                    You've reached the end of this set. Great job! 🎉
                                </p>
                            )}
                        </div>
                    )}

                    {!showAnswer && (
                        <div className="border-t border-border pt-4">
                            <Button 
                                onClick={handleShowAnswer}
                                className="w-full"
                                size="lg"
                            >
                                Reveal Answer
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center mb-6">
                    <Button 
                        variant="outline" 
                        onClick={handlePreviousCard}
                        size="sm"
                    >
                        ← Previous
                    </Button>
                    <span className="text-sm text-foreground-muted">
                        Card {allCards.length > 0 ? currentCardIndex + 1 : 0} of {allCards.length}
                    </span>
                    <Button 
                        variant="outline" 
                        onClick={handleNextCard}
                        size="sm"
                    >
                        Next →
                    </Button>
                </div>

                {/* Card stats */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Card Statistics</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-foreground-muted">Status:</span>
                                <span className="ml-2 font-medium capitalize">{flashcard.status}</span>
                            </div>
                            <div>
                                <span className="text-foreground-muted">Difficulty:</span>
                                <span className="ml-2 font-medium">Level {flashcard.difficulty_level}</span>
                            </div>
                            <div>
                                <span className="text-foreground-muted">Reviews:</span>
                                <span className="ml-2 font-medium">{flashcard.review_count}</span>
                            </div>
                            <div>
                                <span className="text-foreground-muted">Correct:</span>
                                <span className="ml-2 font-medium">{flashcard.correct_count}</span>
                            </div>
                        </div>
                        {flashcard.last_reviewed && (
                            <div className="mt-3 text-sm text-foreground-muted">
                                Last reviewed: {new Date(flashcard.last_reviewed).toLocaleDateString()}
                            </div>
                        )}
                    </Card.Header>
                </Card>
            </div>
        </div>
    );
}