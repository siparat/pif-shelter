import {
	acceptInvitationRequestSchema,
	acceptInvitationResponseSchema,
	animalSummarySchema,
	animalWithLabelsSchema,
	apiErrorSchema,
	approveContactsRequestSchema,
	approveContactsResponseSchema,
	assignAnimalLabelRequestSchema,
	assignAnimalLabelResponseSchema,
	banContactsRequestSchema,
	banContactsResponseSchema,
	cancelDonationSubscriptionByTokenRequestSchema,
	cancelDonationSubscriptionByTokenResponseSchema,
	cancelDonationSubscriptionRequestSchema,
	cancelDonationSubscriptionResponseSchema,
	cancelGuardianshipByTokenRequestSchema,
	cancelGuardianshipByTokenResponseSchema,
	cancelGuardianshipRequestSchema,
	cancelGuardianshipResponseSchema,
	changeAnimalStatusRequestSchema,
	changeAnimalStatusResponseSchema,
	confirmMeetingRequestResponseSchema,
	createAnimalLabelRequestSchema,
	createAnimalLabelResponseSchema,
	createAnimalRequestSchema,
	createAnimalResponseSchema,
	deleteAnimalResponseSchema,
	createCampaignRequestSchema,
	createCampaignResponseSchema,
	createDonationSubscriptionRequestSchema,
	createDonationSubscriptionResponseSchema,
	createInvitationRequestSchema,
	createInvitationResponseSchema,
	createManualExpenseRequestSchema,
	createManualExpenseResponseSchema,
	createMeetingRequestResponseSchema,
	createMeetingRequestSchema,
	createOneTimeDonationRequestSchema,
	createOneTimeDonationResponseSchema,
	createPostRequestSchema,
	createPostResponseSchema,
	createWishlistCategoryRequestSchema,
	createWishlistCategoryResponseSchema,
	createWishlistItemRequestSchema,
	createWishlistItemResponseSchema,
	deleteContactFromBlacklistResponseSchema,
	deleteManualExpenseRequestSchema,
	deleteManualExpenseResponseSchema,
	generateMonthlyFinanceReportRequestSchema,
	generateMonthlyFinanceReportResponseSchema,
	getAdminDashboardSummaryResponseSchema,
	getAnimalByIdRequestSchema,
	getAnimalByIdResponseSchema,
	getBlacklistByIdResponseSchema,
	getCampaignByIdResponseSchema,
	getGuardianshipByAnimalRequestSchema,
	getGuardianshipByAnimalResponseSchema,
	getMeetingRequestByIdResponseSchema,
	getMyGaurdianshipsResponseSchema,
	getPostResponseSchema,
	getPublicWishlistResponseSchema,
	getUploadUrlRequestSchema,
	getUploadUrlResponseSchema,
	getWishlistManageResponseSchema,
	listAnimalLabelsResponseSchema,
	listAnimalsRequestSchema,
	listAnimalsResponseSchema,
	listBlacklistQuerySchema,
	listBlacklistResponseSchema,
	listCuratorMeetingRequestsQuerySchema,
	listCuratorMeetingRequestsResponseSchema,
	listLedgerForMonthQuerySchema,
	listLedgerForMonthResponseSchema,
	listVolunteersResponseSchema,
	listPostsRequestSchema,
	listPostsResponseSchema,
	manageWishlistCategorySchema,
	paginationSchema,
	paymentWebhookRequestSchema,
	paymentWebhookResponseSchema,
	publicLedgerReportQuerySchema,
	publicLedgerReportResponseSchema,
	publicMonthlyLedgerExcelUrlQuerySchema,
	publicMonthlyLedgerExcelUrlResponseSchema,
	publicWishlistCategorySchema,
	rejectMeetingRequestDtoSchema,
	rejectMeetingRequestResponseSchema,
	searchCampaignsRequestSchema,
	searchCampaignsResponseSchema,
	setAnimalCuratorRequestSchema,
	setAnimalCuratorResponseSchema,
	setCostOfGuardianshipRequestSchema,
	setCostOfGuardianshipResponseSchema,
	setPostReactionRequestSchema,
	setTelegramUnreachableRequestSchema,
	setTelegramUnreachableResponseSchema,
	startGuardianshipAuthenticatedRequestSchema,
	startGuardianshipRequestSchema,
	startGuardianshipResponseSchema,
	suspectContactsRequestSchema,
	suspectContactsResponseSchema,
	updateAnimalLabelRequestSchema,
	updateAnimalLabelResponseSchema,
	updateAnimalRequestSchema,
	updateAnimalResponseSchema,
	updateCampaignRequestSchema,
	updateCampaignResponseSchema,
	updateManualExpenseRequestSchema,
	updateManualExpenseResponseSchema,
	updatePostRequestSchema,
	updatePostResponseSchema,
	updateWishlistCategoryRequestSchema,
	updateWishlistCategoryResponseSchema,
	updateWishlistItemRequestSchema,
	updateWishlistItemResponseSchema,
	volunteerSummarySchema
} from '@pif/contracts';
import { createZodDto } from 'nestjs-zod';

export class AcceptInvitationRequestDto extends createZodDto(acceptInvitationRequestSchema) {}
export class AcceptInvitationResponseDto extends createZodDto(acceptInvitationResponseSchema) {}
export class AnimalDto extends createZodDto(animalWithLabelsSchema) {}
export class AnimalSummaryDto extends createZodDto(animalSummarySchema) {}
export class ApiErrorResponseDto extends createZodDto(apiErrorSchema) {}
export class ApproveContactsRequestDto extends createZodDto(approveContactsRequestSchema) {}
export class ApproveContactsResponseDto extends createZodDto(approveContactsResponseSchema) {}
export class AssignAnimalLabelRequestDto extends createZodDto(assignAnimalLabelRequestSchema) {}
export class AssignAnimalLabelResponseDto extends createZodDto(assignAnimalLabelResponseSchema) {}
export class BanContactsRequestDto extends createZodDto(banContactsRequestSchema) {}
export class BanContactsResponseDto extends createZodDto(banContactsResponseSchema) {}
export class CancelDonationSubscriptionByTokenRequestDto extends createZodDto(
	cancelDonationSubscriptionByTokenRequestSchema
) {}
export class CancelDonationSubscriptionByTokenResponseDto extends createZodDto(
	cancelDonationSubscriptionByTokenResponseSchema
) {}
export class CancelDonationSubscriptionRequestDto extends createZodDto(cancelDonationSubscriptionRequestSchema) {}
export class CancelDonationSubscriptionResponseDto extends createZodDto(cancelDonationSubscriptionResponseSchema) {}
export class CancelGuardianshipByTokenRequestDto extends createZodDto(cancelGuardianshipByTokenRequestSchema) {}
export class CancelGuardianshipByTokenResponseDto extends createZodDto(cancelGuardianshipByTokenResponseSchema) {}
export class CancelGuardianshipRequestDto extends createZodDto(cancelGuardianshipRequestSchema) {}
export class CancelGuardianshipResponseDto extends createZodDto(cancelGuardianshipResponseSchema) {}
export class ChangeAnimalStatusRequestDto extends createZodDto(changeAnimalStatusRequestSchema) {}
export class ChangeAnimalStatusResponseDto extends createZodDto(changeAnimalStatusResponseSchema) {}
export class ConfirmMeetingRequestResponseDto extends createZodDto(confirmMeetingRequestResponseSchema) {}
export class CreateAnimalLabelRequestDto extends createZodDto(createAnimalLabelRequestSchema) {}
export class CreateAnimalLabelResponseDto extends createZodDto(createAnimalLabelResponseSchema) {}
export class CreateAnimalRequestDto extends createZodDto(createAnimalRequestSchema) {}
export class CreateAnimalResponseDto extends createZodDto(createAnimalResponseSchema) {}
export class DeleteAnimalResponseDto extends createZodDto(deleteAnimalResponseSchema) {}
export class CreateCampaignRequestDto extends createZodDto(createCampaignRequestSchema) {}
export class CreateCampaignResponseDto extends createZodDto(createCampaignResponseSchema) {}
export class CreateDonationSubscriptionRequestDto extends createZodDto(createDonationSubscriptionRequestSchema) {}
export class CreateDonationSubscriptionResponseDto extends createZodDto(createDonationSubscriptionResponseSchema) {}
export class CreateInvitationRequestDto extends createZodDto(createInvitationRequestSchema) {}
export class CreateInvitationResponseDto extends createZodDto(createInvitationResponseSchema) {}
export class CreateManualExpenseRequestDto extends createZodDto(createManualExpenseRequestSchema) {}
export class CreateManualExpenseResponseDto extends createZodDto(createManualExpenseResponseSchema) {}
export class CreateMeetingRequestDto extends createZodDto(createMeetingRequestSchema) {}
export class CreateMeetingRequestResponseDto extends createZodDto(createMeetingRequestResponseSchema) {}
export class CreateOneTimeDonationRequestDto extends createZodDto(createOneTimeDonationRequestSchema) {}
export class CreateOneTimeDonationResponseDto extends createZodDto(createOneTimeDonationResponseSchema) {}
export class CreatePostRequestDto extends createZodDto(createPostRequestSchema) {}
export class CreatePostResponseDto extends createZodDto(createPostResponseSchema) {}
export class CreateWishlistCategoryRequestDto extends createZodDto(createWishlistCategoryRequestSchema) {}
export class CreateWishlistCategoryResponseDto extends createZodDto(createWishlistCategoryResponseSchema) {}
export class CreateWishlistItemRequestDto extends createZodDto(createWishlistItemRequestSchema) {}
export class CreateWishlistItemResponseDto extends createZodDto(createWishlistItemResponseSchema) {}
export class DeleteContactFromBlacklistResponseDto extends createZodDto(deleteContactFromBlacklistResponseSchema) {}
export class DeleteManualExpenseRequestDto extends createZodDto(deleteManualExpenseRequestSchema) {}
export class DeleteManualExpenseResponseDto extends createZodDto(deleteManualExpenseResponseSchema) {}
export class GenerateMonthlyFinanceReportRequestDto extends createZodDto(generateMonthlyFinanceReportRequestSchema) {}
export class GenerateMonthlyFinanceReportResponseDto extends createZodDto(generateMonthlyFinanceReportResponseSchema) {}
export class GetAdminDashboardSummaryResponseDto extends createZodDto(getAdminDashboardSummaryResponseSchema) {}
export class GetAnimalByIdRequestDto extends createZodDto(getAnimalByIdRequestSchema) {}
export class GetAnimalByIdResponseDto extends createZodDto(getAnimalByIdResponseSchema) {}
export class GetBlacklistByIdResponseDto extends createZodDto(getBlacklistByIdResponseSchema) {}
export class GetCampaignByIdResponseDto extends createZodDto(getCampaignByIdResponseSchema) {}
export class GetGuardianshipByAnimalRequestDto extends createZodDto(getGuardianshipByAnimalRequestSchema) {}
export class GetGuardianshipByAnimalResponseDto extends createZodDto(getGuardianshipByAnimalResponseSchema) {}
export class GetMeetingRequestByIdResponseDto extends createZodDto(getMeetingRequestByIdResponseSchema) {}
export class GetMyGaurdianshipsResponseDto extends createZodDto(getMyGaurdianshipsResponseSchema) {}
export class GetPostResponseDto extends createZodDto(getPostResponseSchema) {}
export class GetPublicWishlistResponseDto extends createZodDto(getPublicWishlistResponseSchema) {}
export class GetUploadUrlRequestDto extends createZodDto(getUploadUrlRequestSchema) {}
export class GetUploadUrlResponseDto extends createZodDto(getUploadUrlResponseSchema) {}
export class GetWishlistManageResponseDto extends createZodDto(getWishlistManageResponseSchema) {}
export class ListAnimalLabelsResponseDto extends createZodDto(listAnimalLabelsResponseSchema) {}
export class ListAnimalsRequestDto extends createZodDto(listAnimalsRequestSchema) {}
export class ListAnimalsResponseDto extends createZodDto(listAnimalsResponseSchema) {}
export class ListBlacklistQueryDto extends createZodDto(listBlacklistQuerySchema) {}
export class ListBlacklistResponseDto extends createZodDto(listBlacklistResponseSchema) {}
export class ListCuratorMeetingRequestsQueryDto extends createZodDto(listCuratorMeetingRequestsQuerySchema) {}
export class ListCuratorMeetingRequestsResponseDto extends createZodDto(listCuratorMeetingRequestsResponseSchema) {}
export class ListLedgerForMonthQueryDto extends createZodDto(listLedgerForMonthQuerySchema) {}
export class ListLedgerForMonthResponseDto extends createZodDto(listLedgerForMonthResponseSchema) {}
export class ListVolunteersResponseDto extends createZodDto(listVolunteersResponseSchema) {}
export class ListPostsRequestDto extends createZodDto(listPostsRequestSchema) {}
export class ListPostsResponseDto extends createZodDto(listPostsResponseSchema) {}
export class ManageWishlistCategoryDto extends createZodDto(manageWishlistCategorySchema) {}
export class PaginationDto extends createZodDto(paginationSchema) {}
export class PaymentWebhookRequestDto extends createZodDto(paymentWebhookRequestSchema) {}
export class PaymentWebhookResponseDto extends createZodDto(paymentWebhookResponseSchema) {}
export class PublicLedgerReportQueryDto extends createZodDto(publicLedgerReportQuerySchema) {}
export class PublicLedgerReportResponseDto extends createZodDto(publicLedgerReportResponseSchema) {}
export class PublicMonthlyLedgerExcelUrlQueryDto extends createZodDto(publicMonthlyLedgerExcelUrlQuerySchema) {}
export class PublicMonthlyLedgerExcelUrlResponseDto extends createZodDto(publicMonthlyLedgerExcelUrlResponseSchema) {}
export class PublicWishlistCategoryDto extends createZodDto(publicWishlistCategorySchema) {}
export class RejectMeetingRequestDto extends createZodDto(rejectMeetingRequestDtoSchema) {}
export class RejectMeetingRequestResponseDto extends createZodDto(rejectMeetingRequestResponseSchema) {}
export class SearchCampaignsRequestDto extends createZodDto(searchCampaignsRequestSchema) {}
export class SearchCampaignsResponseDto extends createZodDto(searchCampaignsResponseSchema) {}
export class SetAnimalCuratorRequestDto extends createZodDto(setAnimalCuratorRequestSchema) {}
export class SetAnimalCuratorResponseDto extends createZodDto(setAnimalCuratorResponseSchema) {}
export class SetCostOfGuardianshipRequestDto extends createZodDto(setCostOfGuardianshipRequestSchema) {}
export class SetCostOfGuardianshipResponseDto extends createZodDto(setCostOfGuardianshipResponseSchema) {}
export class SetPostReactionRequestDto extends createZodDto(setPostReactionRequestSchema) {}
export class SetTelegramUnreachableRequestDto extends createZodDto(setTelegramUnreachableRequestSchema) {}
export class SetTelegramUnreachableResponseDto extends createZodDto(setTelegramUnreachableResponseSchema) {}
export class StartGuardianshipAuthenticatedRequestDto extends createZodDto(
	startGuardianshipAuthenticatedRequestSchema
) {}
export class StartGuardianshipRequestDto extends createZodDto(startGuardianshipRequestSchema) {}
export class StartGuardianshipResponseDto extends createZodDto(startGuardianshipResponseSchema) {}
export class SuspectContactsRequestDto extends createZodDto(suspectContactsRequestSchema) {}
export class SuspectContactsResponseDto extends createZodDto(suspectContactsResponseSchema) {}
export class UpdateAnimalLabelRequestDto extends createZodDto(updateAnimalLabelRequestSchema) {}
export class UpdateAnimalLabelResponseDto extends createZodDto(updateAnimalLabelResponseSchema) {}
export class UpdateAnimalRequestDto extends createZodDto(updateAnimalRequestSchema) {}
export class UpdateAnimalResponseDto extends createZodDto(updateAnimalResponseSchema) {}
export class UpdateCampaignRequestDto extends createZodDto(updateCampaignRequestSchema) {}
export class UpdateCampaignResponseDto extends createZodDto(updateCampaignResponseSchema) {}
export class UpdateManualExpenseRequestDto extends createZodDto(updateManualExpenseRequestSchema) {}
export class UpdateManualExpenseResponseDto extends createZodDto(updateManualExpenseResponseSchema) {}
export class UpdatePostRequestDto extends createZodDto(updatePostRequestSchema) {}
export class UpdatePostResponseDto extends createZodDto(updatePostResponseSchema) {}
export class UpdateWishlistCategoryRequestDto extends createZodDto(updateWishlistCategoryRequestSchema) {}
export class UpdateWishlistCategoryResponseDto extends createZodDto(updateWishlistCategoryResponseSchema) {}
export class UpdateWishlistItemRequestDto extends createZodDto(updateWishlistItemRequestSchema) {}
export class UpdateWishlistItemResponseDto extends createZodDto(updateWishlistItemResponseSchema) {}
export class VolunteerSummaryDto extends createZodDto(volunteerSummarySchema) {}
export * from '@pif/contracts';
